import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/shared/lib/seo";
import { dealPath } from "@/features/public-catalog/seo";
import { getPublishedDeals } from "@/features/public-catalog/server/queries";

/** Chỉ liệt kê trang công khai. Dashboard/admin là trang riêng tư, không đưa vào sitemap. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const deals = await getPublishedDeals();
  return [
    { url: absoluteUrl("/"), changeFrequency: "hourly", priority: 1 },
    { url: absoluteUrl("/dieu-khoan"), changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/bao-mat"), changeFrequency: "yearly", priority: 0.2 },
    ...deals.map((deal) => ({
      url: absoluteUrl(dealPath(deal)),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}
