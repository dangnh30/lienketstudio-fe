import type { Platform } from "./platform";

/* So sánh giá cho người mua: sản phẩm gốc (Shopee) so với TikTok Shop và các website khác */

/** Từ mức tin cậy này trở lên coi là "cùng sản phẩm" (trùng mã model + tên) */
export const SAME_PRODUCT_CONFIDENCE = 90;

export type PlatformCandidate = {
  /** % tin cậy là cùng sản phẩm */
  confidence: number;
  title: string;
  shop: string;
  price: number;
  sold: string;
  note: string;
};

export type WebsiteOffer = { name: string; domain: string; price: number; title: string };

export type Comparison = {
  source: { platform: Platform; price: number; coupon: number; checkedAt: string; shop: string };
  other: { platform: Platform; candidates: PlatformCandidate[] };
  websites: WebsiteOffer[];
  /** Từ khóa gợi ý khi tìm trên Google */
  searchTerm: string;
};

export type CompareTarget = "platform" | "web";

export const isSameProduct = (c: PlatformCandidate) => c.confidence >= SAME_PRODUCT_CONFIDENCE;

export type Verdict = { where: string; price: number; saving: number; savingPercent: number; sourceIsCheapest: boolean };

/** Nơi rẻ nhất trong các nguồn người dùng chọn (chỉ tính sản phẩm trùng khớp) */
export function cheapestOption(
  comparison: Comparison,
  targets: Record<CompareTarget, boolean>,
  labels: Record<Platform, string>,
): Verdict {
  const sourceLabel = labels[comparison.source.platform];
  const options = [
    { where: sourceLabel, price: comparison.source.price },
    ...(targets.platform ? comparison.other.candidates.filter(isSameProduct).map((c) => ({ where: labels[comparison.other.platform], price: c.price })) : []),
    ...(targets.web ? comparison.websites.map((w) => ({ where: w.name, price: w.price })) : []),
  ];
  const best = options.reduce((a, b) => (b.price < a.price ? b : a));
  const saving = comparison.source.price - best.price;
  return {
    where: best.where,
    price: best.price,
    saving,
    savingPercent: Math.round((saving / comparison.source.price) * 100),
    sourceIsCheapest: best.where === sourceLabel,
  };
}

/** Phân loại nội dung người dùng nhập vào ô tìm kiếm */
export type QueryKind = { kind: "empty" } | { kind: "shopee-url"; url: string } | { kind: "other-url" } | { kind: "name"; text: string };

export function classifyQuery(input: string): QueryKind {
  const v = input.trim();
  if (!v) return { kind: "empty" };
  const isUrl = /^https?:\/\/|^www\.|\.(vn|com)\//i.test(v);
  if (!isUrl) return { kind: "name", text: v };
  return /shopee\.vn|shp\.ee/i.test(v) ? { kind: "shopee-url", url: v } : { kind: "other-url" };
}
