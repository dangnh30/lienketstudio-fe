import { ImageResponse } from "next/og";
import { bestOffer, priceChangePercent } from "@/domain/deal";
import { PLATFORM_LABEL } from "@/domain/platform";
import { siteConfig } from "@/shared/config/site";
import { formatVnd } from "@/shared/lib/format";
import { getPublishedDeal, getPublishedDeals } from "@/features/public-catalog/server/queries";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "So sánh giá và lịch sử giá";

export async function generateStaticParams() {
  const deals = await getPublishedDeals();
  return deals.map((d) => ({ slug: d.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const deal = await getPublishedDeal((await params).slug);
  const offer = deal ? bestOffer(deal) : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#ffffff",
          color: "#18181b",
          borderTop: "16px solid #D9621F",
        }}
      >
        <div style={{ fontSize: 30, color: "#71717a" }}>{siteConfig.name}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 60, fontWeight: 700, lineHeight: 1.2 }}>{deal?.name ?? siteConfig.name}</div>
          {deal && offer && (
            <div style={{ display: "flex", gap: 24, alignItems: "baseline" }}>
              <span style={{ fontSize: 72, fontWeight: 700, color: "#D9621F" }}>{formatVnd(offer.finalPrice).replace("₫", " đ")}</span>
              <span style={{ fontSize: 32, color: "#A84A15" }}>
                {priceChangePercent(deal)}% · {PLATFORM_LABEL[offer.platform]}
              </span>
            </div>
          )}
        </div>
        <div style={{ fontSize: 26, color: "#71717a" }}>So sánh giá Shopee và TikTok Shop · lịch sử giá 90 ngày</div>
      </div>
    ),
    size,
  );
}
