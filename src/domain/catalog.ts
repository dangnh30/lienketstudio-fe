import type { Platform } from "./platform";

/** Gợi ý ghép cùng một sản phẩm trên hai sàn để so giá */
export type MatchStatus = "pending" | "confirmed" | "rejected";

export type MatchCandidate = {
  platform: Platform;
  title: string;
  modelCode: string;
  finalPrice: number;
};

export type ProductMatch = {
  id: string;
  dealId: string;
  reason: string;
  status: MatchStatus;
  candidates: MatchCandidate[];
};

/** Kênh nơi link rút gọn được chia sẻ */
export type LinkChannel = "fbpage" | "fbgroup" | "site";

export const LINK_CHANNEL_LABEL: Record<LinkChannel, string> = {
  fbpage: "Facebook Page",
  fbgroup: "Facebook Group",
  site: "Trang so sánh giá",
};

export type ShortLink = {
  code: string;
  dealId: string;
  channel: LinkChannel;
  createdAt: string;
  /** Lượt bấm hệ thống tự đếm (đã loại bot) */
  clicks: number;
  /** Lượt sàn ghi nhận */
  platformClicks: number;
  orders: number;
  enabled: boolean;
};

/** % lượt sàn ghi nhận so với lượt tự đếm */
export function matchRate(link: Pick<ShortLink, "clicks" | "platformClicks">) {
  return link.clicks ? Math.round((link.platformClicks / link.clicks) * 100) : null;
}

export function conversionRate(orders: number, clicks: number) {
  return clicks ? (orders / clicks) * 100 : null;
}
