import "server-only";
import { canPublishTo, isApprovable } from "@/domain/deal";
import { CHANNELS, type Channel } from "@/domain/platform";
import { planQueueItems } from "@/domain/publishing";
import { DomainError } from "@/shared/lib/action-result";
import { repositories } from "@/server/container";
import type { Repositories } from "@/server/repositories/types";

/**
 * Nghiệp vụ duyệt deal. Phụ thuộc vào Repositories qua constructor (dependency injection)
 * nên test được bằng repository giả mà không cần Next.js.
 */
export class DealReviewService {
  constructor(private readonly repos: Repositories) {}

  /** Duyệt một deal: đổi trạng thái + tạo các mục trong Lịch đăng theo kênh đã chọn */
  async approve(workspaceId: string, dealId: string) {
    const { deals, queue, workspaces } = this.repos;
    const [deal, workspace] = await Promise.all([deals.findById(workspaceId, dealId), workspaces.findById(workspaceId)]);
    if (!deal || !workspace) throw new DomainError("Không tìm thấy deal");
    if (!isApprovable(deal, workspace.settings.minScore)) throw new DomainError("Deal này không đủ điều kiện duyệt");

    const channels = CHANNELS.filter((c) => deal.channels[c] && canPublishTo(deal, c));
    if (channels.length === 0) throw new DomainError("Chọn ít nhất một kênh đăng");

    const existing = await queue.listByWorkspace(workspaceId, "fbpage");
    const items = planQueueItems(
      deal,
      channels,
      existing.map((q) => q.time).filter((t): t is string => t !== null),
      () => crypto.randomUUID(),
    );

    await queue.addMany(workspaceId, items);
    await deals.update(workspaceId, dealId, { status: "approved" });

    if (channels.includes("tiktok")) {
      await workspaces.addNotification(workspaceId, {
        time: "vừa xong",
        text: `Gói video TikTok cho ${deal.name} đã sẵn sàng`,
        href: "/app/schedule/tiktok",
        read: false,
      });
    }
    return { deal, created: items.length };
  }

  /** Duyệt nhiều deal; bỏ qua deal không đủ điều kiện thay vì dừng cả lô */
  async approveMany(workspaceId: string, dealIds: string[]) {
    let approved = 0;
    let posts = 0;
    for (const id of dealIds) {
      try {
        const { created } = await this.approve(workspaceId, id);
        approved++;
        posts += created;
      } catch (error) {
        if (!(error instanceof DomainError)) throw error;
      }
    }
    return { approved, posts };
  }

  async skip(workspaceId: string, dealId: string) {
    const deal = await this.repos.deals.findById(workspaceId, dealId);
    if (!deal || deal.status !== "pending") throw new DomainError("Không tìm thấy deal chờ duyệt");
    await this.repos.deals.update(workspaceId, dealId, { status: "skipped" });
  }

  async setChannel(workspaceId: string, dealId: string, channel: Channel, enabled: boolean) {
    const deal = await this.repos.deals.findById(workspaceId, dealId);
    if (!deal) throw new DomainError("Không tìm thấy deal");
    if (enabled && !canPublishTo(deal, channel)) {
      throw new DomainError("TikTok chỉ gắn được giỏ hàng cho sản phẩm TikTok Shop");
    }
    await this.repos.deals.update(workspaceId, dealId, { channels: { ...deal.channels, [channel]: enabled } });
  }
}

export const dealReviewService = () => new DealReviewService(repositories());
