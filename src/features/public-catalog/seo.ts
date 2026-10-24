import { bestOffer, priceChangePercent, sortedOffers, type Deal } from "@/domain/deal";
import { PLATFORM_LABEL } from "@/domain/platform";
import { siteConfig } from "@/shared/config/site";
import { absoluteUrl } from "@/shared/lib/seo";
import { formatVnd } from "@/shared/lib/format";

export const dealPath = (deal: Pick<Deal, "slug">) => `/deal/${deal.slug}`;

export function dealTitle(deal: Deal) {
  return `${deal.name}: mua ở đâu rẻ nhất? So sánh giá Shopee, TikTok Shop`;
}

export function dealDescription(deal: Deal) {
  const offer = bestOffer(deal);
  return `${deal.name} giá ${formatVnd(offer.finalPrice)} tại ${PLATFORM_LABEL[offer.platform]} (${priceChangePercent(deal)}% so với giá trung bình 30 ngày). So sánh với TikTok Shop, Tiki, Lazada và các website khác, kèm lịch sử giá 90 ngày.`;
}

/** Structured data: Product + AggregateOffer + BreadcrumbList cho Google rich results */
export function dealJsonLd(deal: Deal) {
  const url = absoluteUrl(dealPath(deal));
  const offers = sortedOffers(deal).filter((o) => o.inStock);
  const prices = offers.map((o) => o.finalPrice);

  return [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: deal.name,
      url,
      image: `${url}/opengraph-image`,
      description: dealDescription(deal),
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "VND",
        lowPrice: prices.length ? Math.min(...prices) : undefined,
        highPrice: prices.length ? Math.max(...prices) : undefined,
        offerCount: offers.length,
        availability: offers.length ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        offers: offers.map((o) => ({
          "@type": "Offer",
          price: o.finalPrice,
          priceCurrency: "VND",
          availability: "https://schema.org/InStock",
          seller: { "@type": "Organization", name: PLATFORM_LABEL[o.platform] },
        })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: siteConfig.name, item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: deal.name, item: url },
      ],
    },
  ];
}
