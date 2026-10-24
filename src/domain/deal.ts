import type { Channel, Platform } from "./platform";

export type Offer = {
  platform: Platform;
  listPrice: number;
  finalPrice: number;
  coupon: number;
  /** % hoa hồng */
  commissionRate: number;
  inStock: boolean;
  /** Giờ kiểm tra giá gần nhất, "HH:mm" */
  checkedAt: string;
};

export type DealStatus = "pending" | "approved" | "skipped";
/** fake: giảm giá ảo (tăng giá trước khi giảm); oos: hết hàng */
export type DealFlag = "fake" | "oos" | null;

export type Deal = {
  id: string;
  slug: string;
  name: string;
  avg30: number;
  low90: number;
  high90: number;
  score: number;
  status: DealStatus;
  flag: DealFlag;
  note?: string;
  offers: Offer[];
  /** Giá cuối theo thời gian, phần tử cuối là giá hiện tại */
  priceHistory: number[];
  /** Kênh người dùng chọn đăng khi duyệt */
  channels: Record<Channel, boolean>;
};

/** Ưu đãi tốt nhất: rẻ nhất trong các sàn còn hàng (nếu đều hết hàng thì xét tất cả). */
export function bestOffer(deal: Pick<Deal, "offers">): Offer {
  const inStock = deal.offers.filter((o) => o.inStock);
  const pool = inStock.length ? inStock : deal.offers;
  return pool.reduce((best, o) => (o.finalPrice < best.finalPrice ? o : best));
}

/** % thay đổi của giá tốt nhất so với giá trung bình 30 ngày (âm = đang giảm). */
export function priceChangePercent(deal: Pick<Deal, "offers" | "avg30">): number {
  return Math.round(((bestOffer(deal).finalPrice - deal.avg30) / deal.avg30) * 100);
}

export function offerOn(deal: Pick<Deal, "offers">, platform: Platform): Offer | undefined {
  return deal.offers.find((o) => o.platform === platform);
}

/** Offers sắp xếp từ rẻ đến đắt */
export function sortedOffers(deal: Pick<Deal, "offers">): Offer[] {
  return [...deal.offers].sort((a, b) => a.finalPrice - b.finalPrice);
}

/** TikTok chỉ gắn được giỏ hàng cho sản phẩm có trên TikTok Shop. */
export function canPublishTo(deal: Pick<Deal, "offers">, channel: Channel): boolean {
  return channel !== "tiktok" || deal.offers.some((o) => o.platform === "tiktokshop");
}

export type ReviewState = "reviewable" | "below-score" | "flagged-fake" | "out-of-stock";

/** Trạng thái hiển thị trong màn Duyệt deal */
export function reviewState(deal: Deal, minScore: number): ReviewState {
  if (deal.flag === "fake") return "flagged-fake";
  if (deal.flag === "oos") return "out-of-stock";
  if (deal.score < minScore) return "below-score";
  return "reviewable";
}

export function isApprovable(deal: Deal, minScore: number) {
  return deal.status === "pending" && reviewState(deal, minScore) === "reviewable";
}
