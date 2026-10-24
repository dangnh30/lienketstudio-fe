import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PLATFORM_LABEL } from "@/domain/platform";
import { siteConfig } from "@/shared/config/site";
import { formatVnd, slugify } from "@/shared/lib/format";
import { buildMetadata } from "@/shared/lib/seo";
import { buttonVariants } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { JsonLd } from "@/shared/ui/json-ld";
import { PlatformBadge } from "@/shared/ui/platform-badge";
import { AffiliateLink } from "@/features/public-catalog/components/affiliate-link";
import { CompareResults } from "@/features/public-catalog/components/compare-results";
import { CompareSearch } from "@/features/public-catalog/components/compare-search";
import { PriceHistoryChart } from "@/features/public-catalog/components/price-history-chart";
import { dealDescription, dealJsonLd, dealPath, dealTitle } from "@/features/public-catalog/seo";
import { getComparison, getPublishedDeal, getPublishedDeals } from "@/features/public-catalog/server/queries";

// Prerender sẵn mọi sản phẩm công khai; sản phẩm mới được render tĩnh ở lần truy cập đầu rồi cache
export async function generateStaticParams() {
  const deals = await getPublishedDeals();
  return deals.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: PageProps<"/deal/[slug]">): Promise<Metadata> {
  const deal = await getPublishedDeal((await params).slug);
  if (!deal) return buildMetadata({ title: "Không tìm thấy sản phẩm", noIndex: true });
  return buildMetadata({ title: dealTitle(deal), description: dealDescription(deal), path: dealPath(deal) });
}

export default async function ComparePage({ params }: PageProps<"/deal/[slug]">) {
  const data = await getComparison((await params).slug);
  if (!data) notFound();
  const { deal, comparison } = data;
  const { source } = comparison;
  const sourceLabel = PLATFORM_LABEL[source.platform];

  return (
    <>
      <JsonLd data={dealJsonLd(deal)} />
      {/* Ô tìm kiếm điền sẵn link sản phẩm gốc, để người mua dán link khác và so tiếp */}
      <CompareSearch size="md" defaultValue={`https://shopee.vn/${slugify(deal.name)}-i.123456.789012`} />

      <Card className="flex flex-wrap items-center gap-[18px] px-5 py-[18px]">
        <div className="flex size-[120px] flex-none items-center justify-center rounded-sm bg-gradient-to-br from-[#f1f1f3] to-[#e6e6ea] text-[13px] text-muted max-[640px]:size-[72px]">
          [Ảnh]
        </div>
        <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-1.5 max-[640px]:basis-[calc(100%-90px)]">
          <div className="flex items-center gap-1.5">
            <PlatformBadge platform={source.platform} />
            <span className="text-[13px] text-muted">Sản phẩm bạn dán</span>
          </div>
          <h1 className="text-[22px] leading-[1.3]">{deal.name}</h1>
          <p className="text-[13px] text-muted">
            {source.shop} · {source.coupon ? `đã trừ mã ${formatVnd(source.coupon)} · ` : ""}kiểm tra lúc {source.checkedAt}
          </p>
        </div>
        <div className="flex flex-col items-start gap-1.5 max-[640px]:w-full max-[640px]:flex-row max-[640px]:flex-wrap max-[640px]:items-center max-[640px]:gap-x-3 max-[640px]:gap-y-1">
          <span className="text-[13px] text-muted max-[640px]:w-full">Giá trên {sourceLabel}</span>
          <b className="text-2xl tracking-[-0.02em] tnum">{formatVnd(source.price)}</b>
          <AffiliateLink deal={deal} platform={source.platform} className={buttonVariants({ size: "sm", className: "no-underline" })}>
            Mua trên {sourceLabel}
          </AffiliateLink>
        </div>
      </Card>

      <CompareResults comparison={comparison} dealId={deal.id} />

      <Card padded>
        <h2 className="mb-2.5 text-base">Lịch sử giá 90 ngày trên {sourceLabel}</h2>
        <PriceHistoryChart deal={deal} />
        <p className="mt-2 text-[13px] text-muted">
          Thấp nhất 90 ngày {formatVnd(deal.low90)} · cao nhất {formatVnd(deal.high90)} · trung bình 30 ngày {formatVnd(deal.avg30)}
        </p>
      </Card>

      <p className="text-[13px] text-muted">{siteConfig.affiliateDisclosure}</p>
    </>
  );
}
