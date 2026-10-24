import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { repositories } from "@/server/container";

/** Tag chung của mọi dữ liệu công khai – action duyệt deal sẽ revalidate tag này */
export const PUBLIC_DEALS_TAG = "public-deals";

export async function getPublishedDeals() {
  "use cache";
  cacheLife("content");
  cacheTag(PUBLIC_DEALS_TAG);
  return repositories().deals.listPublished();
}

export async function getPublishedDeal(slug: string) {
  "use cache";
  cacheLife("content");
  cacheTag(PUBLIC_DEALS_TAG, `deal:${slug}`);
  return repositories().deals.findPublishedBySlug(slug);
}

/** Sản phẩm + kết quả so sánh giá (TikTok Shop, website khác) cho trang kết quả */
export async function getComparison(slug: string) {
  "use cache";
  cacheLife("content");
  cacheTag(PUBLIC_DEALS_TAG, `deal:${slug}`);
  const { deals, comparisons } = repositories();
  const deal = await deals.findPublishedBySlug(slug);
  if (!deal) return null;
  return { deal, comparison: await comparisons.forDeal(deal) };
}

export const PLATFORM_SETTINGS_TAG = "platform-settings";

/** Số ngày dùng thử hiển thị trên trang công khai (admin đổi cài đặt sẽ revalidate tag này) */
export async function getTrialDays() {
  "use cache";
  cacheLife("content");
  cacheTag(PLATFORM_SETTINGS_TAG);
  return (await repositories().platform.get()).trialDays;
}

/** Sản phẩm hiện ở mục "Đang được so sánh nhiều" */
export async function getPopularDeals(limit = 4) {
  "use cache";
  cacheLife("content");
  cacheTag(PUBLIC_DEALS_TAG);
  const list = await repositories().deals.listPublished();
  return list.filter((d) => !d.flag && d.offers.some((o) => o.platform === "shopee")).slice(0, limit);
}
