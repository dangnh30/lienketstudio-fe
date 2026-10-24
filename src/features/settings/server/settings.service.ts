import "server-only";
import type { Plan } from "@/domain/plan";
import type { Member, Workspace } from "@/domain/workspace";
import { DomainError } from "@/shared/lib/action-result";
import { repositories } from "@/server/container";
import type { Repositories } from "@/server/repositories/types";
import type { z } from "zod";
import type { filterSchema, generalSchema, inviteSchema, notifySchema, scanSchema } from "../schemas";

/** Nghiệp vụ cài đặt workspace – các giới hạn theo gói được kiểm tại đây, không ở UI */
export class SettingsService {
  constructor(private readonly repos: Repositories) {}

  private async load(workspaceId: string) {
    const workspace = await this.repos.workspaces.findById(workspaceId);
    if (!workspace) throw new DomainError("Workspace không tồn tại");
    const plan = await this.repos.plans.findById(workspace.planId as Plan["id"]);
    if (!plan) throw new DomainError("Gói cước không tồn tại");
    return { workspace, plan };
  }

  async overview(workspaceId: string) {
    const { workspace, plan } = await this.load(workspaceId);
    const [plans, accounts, customer] = await Promise.all([
      this.repos.plans.list(),
      this.repos.accounts.get(workspaceId),
      this.repos.customers.list().then((list) => list.find((c) => c.workspaceId === workspaceId) ?? null),
    ]);
    const invoices = customer ? await this.repos.invoices.list({ customerId: customer.id }) : [];
    return { workspace, plan, plans, accounts, customer, invoices };
  }

  async updateGeneral(workspaceId: string, input: z.output<typeof generalSchema>) {
    const { workspace, plan } = await this.load(workspaceId);
    const enabled = new Set(input.niche);
    const niches = workspace.niches.map((n) => ({ ...n, enabled: enabled.has(n.name) }));
    if (niches.filter((n) => n.enabled).length > plan.niches) {
      throw new DomainError(`Gói ${plan.name} chạy tối đa ${plan.niches} ngách cùng lúc`);
    }
    await this.repos.workspaces.update(workspaceId, {
      name: input.name,
      niches,
      general: { ...workspace.general, quietFrom: input.quietFrom, quietTo: input.quietTo },
    });
  }

  async addNiche(workspaceId: string, name: string) {
    const { workspace } = await this.load(workspaceId);
    if (workspace.niches.some((n) => n.name.toLowerCase() === name.toLowerCase())) throw new DomainError("Ngách này đã có");
    // Ngách mới luôn ở trạng thái tắt để không vượt giới hạn gói
    await this.repos.workspaces.update(workspaceId, { niches: [...workspace.niches, { name, enabled: false }] });
  }

  async updateFilter(workspaceId: string, input: z.output<typeof filterSchema>) {
    await this.repos.workspaces.update(workspaceId, { settings: input });
  }

  async updateScan(workspaceId: string, input: z.output<typeof scanSchema>) {
    if (input.hotMinutes > input.normalMinutes) throw new DomainError("Hàng nóng phải được quét dày hơn hàng thường");
    await this.repos.workspaces.update(workspaceId, { scan: input });
  }

  async updateNotify(workspaceId: string, input: z.output<typeof notifySchema>) {
    await this.repos.workspaces.update(workspaceId, { notify: input });
  }

  async inviteMember(workspaceId: string, input: z.output<typeof inviteSchema>) {
    const { workspace, plan } = await this.load(workspaceId);
    if (workspace.members.some((m) => m.email.toLowerCase() === input.email)) throw new DomainError("Email này đã được mời");
    if (workspace.members.length >= plan.members) throw new DomainError(`Gói ${plan.name} có tối đa ${plan.members} thành viên`);
    const member: Member = { id: crypto.randomUUID(), ...input };
    await this.repos.workspaces.update(workspaceId, { members: [...workspace.members, member] });
  }

  async removeMember(workspaceId: string, memberId: string) {
    const { workspace } = await this.load(workspaceId);
    const member = workspace.members.find((m) => m.id === memberId);
    if (!member) throw new DomainError("Không tìm thấy thành viên");
    if (member.role === "owner") throw new DomainError("Không gỡ được chủ hệ thống");
    await this.repos.workspaces.update(workspaceId, { members: workspace.members.filter((m) => m.id !== memberId) });
    return member.name;
  }

  async setPaused(workspaceId: string, paused: boolean) {
    await this.repos.workspaces.update(workspaceId, { paused });
  }

  /** Yêu cầu xóa workspace: phải gõ đúng tên để xác nhận; còn 30 ngày để khôi phục */
  async requestDeletion(workspaceId: string, confirmName: string) {
    const { workspace } = await this.load(workspaceId);
    if (confirmName.trim() !== workspace.name) throw new DomainError("Tên workspace không khớp");
    await this.repos.workspaces.update(workspaceId, { deletionRequestedAt: new Date().toISOString(), paused: true });
  }

  async cancelDeletion(workspaceId: string) {
    await this.repos.workspaces.update(workspaceId, { deletionRequestedAt: null });
  }

  /** Khách tự đổi gói: gói phải đang mở bán, và mức đang dùng không vượt giới hạn gói mới */
  async changePlan(workspaceId: string, planId: Plan["id"]) {
    const { workspace } = await this.load(workspaceId);
    const target = await this.repos.plans.findById(planId);
    if (!target || !target.visible) throw new DomainError("Gói này không còn mở bán");
    if (workspace.planId === planId) throw new DomainError("Bạn đang dùng gói này");
    this.assertFits(workspace, target);

    await this.repos.workspaces.update(workspaceId, { planId });
    const customer = (await this.repos.customers.list()).find((c) => c.workspaceId === workspaceId);
    if (customer) await this.repos.customers.update(customer.id, { planId });
    return target.name;
  }

  private assertFits(workspace: Workspace, plan: Plan) {
    if (workspace.members.length > plan.members) throw new DomainError(`Gói ${plan.name} chỉ có ${plan.members} thành viên, hãy gỡ bớt trước`);
    if (workspace.niches.filter((n) => n.enabled).length > plan.niches) throw new DomainError(`Gói ${plan.name} chỉ chạy ${plan.niches} ngách, hãy tắt bớt trước`);
  }
}

export const settingsService = () => new SettingsService(repositories());
