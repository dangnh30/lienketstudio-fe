import "server-only";
import type { Plan } from "@/domain/plan";
import type { Customer, PlatformSettings } from "@/domain/platform-admin";
import type { User } from "@/domain/user";
import { DomainError } from "@/shared/lib/action-result";
import { recordAudit } from "@/server/audit";
import { repositories } from "@/server/container";
import type { Repositories } from "@/server/repositories/types";

const parseVnDate = (s: string) => {
  const [d, m, y] = s.split("/").map(Number);
  return new Date(y, m - 1, d);
};
const formatVnDate = (date: Date) =>
  `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;

/**
 * Nghiệp vụ khu quản trị nền tảng. Mỗi thao tác thay đổi dữ liệu đều ghi nhật ký
 * (nhật ký chỉ thêm, không sửa/xóa – dùng cho kiểm toán).
 */
export class AdminService {
  constructor(
    private readonly repos: Repositories,
    private readonly admin: User,
  ) {}

  private audit(action: string, target: string, kind: "admin" | "security" | "billing" = "admin") {
    return recordAudit({ actor: this.admin.name, action, target, kind });
  }

  private async customer(id: string): Promise<Customer> {
    const c = await this.repos.customers.findById(id);
    if (!c) throw new DomainError("Không tìm thấy khách hàng");
    return c;
  }

  async changePlan(customerId: string, planId: Plan["id"]) {
    const c = await this.customer(customerId);
    if (c.planId === planId) throw new DomainError("Khách đang dùng gói này");
    const [from, to] = await Promise.all([this.repos.plans.findById(c.planId), this.repos.plans.findById(planId)]);
    if (!to) throw new DomainError("Gói không tồn tại");
    await this.repos.customers.update(customerId, { planId });
    await this.audit(`Đổi gói ${from?.name} → ${to.name}`, c.name);
    return to.name;
  }

  async extendTrial(customerId: string, days = 7) {
    const c = await this.customer(customerId);
    if (c.status !== "trial" || !c.trialEndsAt) throw new DomainError("Khách không ở trạng thái dùng thử");
    const end = parseVnDate(c.trialEndsAt);
    end.setDate(end.getDate() + days);
    const trialEndsAt = formatVnDate(end);
    await this.repos.customers.update(customerId, { trialEndsAt });
    await this.audit(`Gia hạn dùng thử thêm ${days} ngày`, c.name);
    return trialEndsAt;
  }

  async remindPayment(customerId: string) {
    const c = await this.customer(customerId);
    await this.audit("Gửi email nhắc thanh toán", c.name, "billing");
  }

  async lock(customerId: string, reason: string) {
    const c = await this.customer(customerId);
    if (c.status === "locked") throw new DomainError("Tài khoản đã bị khóa");
    await this.repos.customers.update(customerId, { status: "locked", previousStatus: c.status, lockReason: reason });
    await this.audit("Khóa tài khoản", c.name);
    return c.name;
  }

  async unlock(customerId: string) {
    const c = await this.customer(customerId);
    if (c.status !== "locked") throw new DomainError("Tài khoản không bị khóa");
    await this.repos.customers.update(customerId, { status: c.previousStatus ?? "active", lockReason: undefined, previousStatus: undefined });
    await this.audit("Mở khóa tài khoản", c.name);
    return c.name;
  }

  /** Trả về userId của khách để tạo phiên "đăng nhập thay" */
  async impersonate(customerId: string) {
    const c = await this.customer(customerId);
    if (c.status === "locked") throw new DomainError("Tài khoản đang bị khóa");
    await this.audit("Đăng nhập thay khách hàng để hỗ trợ", c.name);
    return c.userId;
  }

  async updatePlan(planId: Plan["id"], patch: Partial<Omit<Plan, "id" | "name">>) {
    const plan = await this.repos.plans.findById(planId);
    if (!plan) throw new DomainError("Gói không tồn tại");
    const changed = (Object.keys(patch) as (keyof typeof patch)[]).filter((k) => patch[k] !== plan[k]);
    await this.repos.plans.update(planId, patch);
    await this.audit(`Sửa gói ${plan.name}${changed.length ? ` (${changed.length} giới hạn)` : ""}`, `Gói ${plan.name}`);
    return plan.name;
  }

  async markInvoicePaid(number: string) {
    const [invoice] = (await this.repos.invoices.list()).filter((i) => i.number === number);
    if (!invoice) throw new DomainError("Không tìm thấy hóa đơn");
    if (invoice.status === "paid") throw new DomainError("Hóa đơn đã thanh toán");
    await this.repos.invoices.update(number, { status: "paid" });
    const c = await this.repos.customers.findById(invoice.customerId);
    if (c?.status === "overdue") await this.repos.customers.update(c.id, { status: "active" });
    await this.audit("Xác nhận đã nhận tiền thủ công", number, "billing");
  }

  async remindInvoice(number: string) {
    const [invoice] = (await this.repos.invoices.list()).filter((i) => i.number === number);
    if (!invoice) throw new DomainError("Không tìm thấy hóa đơn");
    await this.audit("Gửi nhắc thanh toán", number, "billing");
    return (await this.repos.customers.findById(invoice.customerId))?.name ?? "khách hàng";
  }

  async replyTicket(ticketId: string, text: string) {
    const ticket = await this.repos.tickets.findById(ticketId);
    if (!ticket) throw new DomainError("Không tìm thấy yêu cầu");
    await this.repos.tickets.addMessage(ticketId, { from: "support", at: "vừa xong", text });
    if (ticket.status === "open") await this.repos.tickets.update(ticketId, { status: "pending" });
  }

  async setTicketStatus(ticketId: string, status: "open" | "closed") {
    const ticket = await this.repos.tickets.findById(ticketId);
    if (!ticket) throw new DomainError("Không tìm thấy yêu cầu");
    await this.repos.tickets.update(ticketId, { status });
  }

  async updatePlatform(patch: PlatformSettings) {
    const before = await this.repos.platform.get();
    if (patch.broadcastEnabled && !patch.broadcast.trim()) throw new DomainError("Nhập nội dung trước khi bật thông báo");
    await this.repos.platform.update(patch);
    if (JSON.stringify(before) !== JSON.stringify(patch)) {
      const notes = [patch.maintenance && "bật bảo trì", patch.broadcastEnabled && "bật thông báo chung"].filter(Boolean);
      await this.audit(`Sửa cài đặt nền tảng${notes.length ? `, ${notes.join(", ")}` : ""}`, "Cài đặt nền tảng");
    }
  }
}

export const adminService = (admin: User) => new AdminService(repositories(), admin);
