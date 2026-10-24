import type { Channel } from "./platform";
import { CHANNEL_MODE, PLATFORM_LABEL } from "./platform";
import { bestOffer, priceChangePercent, type Deal } from "./deal";
import { formatVnd } from "@/shared/lib/format";

export type QueueStatus = "scheduled" | "ready" | "posted";

export type QueueItem = {
  id: string;
  dealId: string;
  channel: Channel;
  /** "HH:mm" với bài đăng tự động; null với bài đăng tay */
  time: string | null;
  status: QueueStatus;
};

/** Khung giờ đăng tự động Facebook Page trong ngày */
export const AUTO_POST_SLOTS = ["08:30", "10:00", "12:00", "15:30", "18:00", "20:00", "21:00", "22:30"] as const;

/** Chọn khung giờ trống đầu tiên cho bài Facebook Page */
export function nextFreeSlot(taken: string[]): string {
  return AUTO_POST_SLOTS.find((slot) => !taken.includes(slot)) ?? "23:00";
}

/** Tạo các mục lịch đăng khi duyệt một deal (factory thuần, không side-effect) */
export function planQueueItems(
  deal: Deal,
  channels: Channel[],
  takenSlots: string[],
  newId: () => string,
): QueueItem[] {
  return channels.map((channel) =>
    CHANNEL_MODE[channel] === "auto"
      ? { id: newId(), dealId: deal.id, channel, time: nextFreeSlot(takenSlots), status: "scheduled" }
      : { id: newId(), dealId: deal.id, channel, time: null, status: "ready" },
  );
}

/** Nội dung bài đăng chuẩn (Facebook Page / Group) */
export function composePostText(deal: Deal, disclosure: string): string {
  const offer = bestOffer(deal);
  return [
    `Deal thật · ${priceChangePercent(deal)}% so với giá TB 30 ngày`,
    deal.name,
    `Giá cuối: ${formatVnd(offer.finalPrice)} tại ${PLATFORM_LABEL[offer.platform]}${offer.coupon ? " (đã trừ mã)" : ""}`,
    `Thấp nhất 90 ngày: ${formatVnd(deal.low90)}`,
    `Kiểm tra lúc ${offer.checkedAt}`,
    "",
    disclosure,
  ].join("\n");
}
