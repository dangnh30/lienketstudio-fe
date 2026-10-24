import type { ReactNode } from "react";
import type { Deal } from "@/domain/deal";
import type { Platform } from "@/domain/platform";

/** Link rút gọn theo dõi lượt bấm; subId lk_site để tách đơn theo kênh "Trang so sánh giá" */
export function affiliateUrl(deal: Pick<Deal, "id">, platform: Platform) {
  const base = process.env.NEXT_PUBLIC_SHORTLINK_URL ?? "https://go.lienket.vn";
  return `${base}/${deal.id}-${platform === "shopee" ? "sp" : "tt"}?sub=lk_site`;
}

/** Link affiliate: rel="sponsored nofollow" theo hướng dẫn của Google cho link tiếp thị liên kết */
export function AffiliateLink({
  deal,
  platform,
  className,
  children,
}: {
  deal: Pick<Deal, "id">;
  platform: Platform;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a href={affiliateUrl(deal, platform)} rel="sponsored nofollow noopener" target="_blank" className={className}>
      {children}
    </a>
  );
}
