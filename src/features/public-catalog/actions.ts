"use server";

import { z } from "zod";
import { classifyQuery } from "@/domain/comparison";
import { offerOn } from "@/domain/deal";
import { removeDiacritics } from "@/shared/lib/format";
import { repositories } from "@/server/container";

/*
 * Tìm kiếm trên trang công khai chạy bằng server action, nên trang vẫn giữ được
 * HTML tĩnh (cache CDN). Không cần đăng nhập; chỉ đọc dữ liệu công khai.
 */

export type CatalogHit = { id: string; slug: string; name: string; shop: string; sold: string; price: number };

export type SearchResponse =
  | { kind: "error"; message: string }
  | { kind: "redirect"; slug: string }
  | { kind: "results"; query: string; hits: CatalogHit[] };

const norm = (s: string) => removeDiacritics(s).toLowerCase();

export async function searchCatalogAction(input: string): Promise<SearchResponse> {
  const query = classifyQuery(z.string().max(500).parse(input));
  switch (query.kind) {
    case "empty":
      return { kind: "error", message: "Dán link Shopee hoặc gõ tên sản phẩm" };
    case "other-url":
      return { kind: "error", message: "Hiện chỉ đọc được link Shopee. Sản phẩm ở nơi khác thì gõ tên sản phẩm." };
    case "shopee-url": {
      const deal = await repositories().comparisons.resolveShopeeUrl(query.url);
      return deal ? { kind: "redirect", slug: deal.slug } : { kind: "error", message: "Chưa đọc được sản phẩm từ link này, thử gõ tên sản phẩm." };
    }
    case "name": {
      const q = norm(query.text);
      const deals = await repositories().deals.listPublished();
      const hits = deals.flatMap((d) => {
        const shopee = offerOn(d, "shopee");
        return shopee && norm(d.name).includes(q)
          ? [{ id: d.id, slug: d.slug, name: d.name, shop: "[Tên shop Shopee]", sold: "1,2k", price: shopee.finalPrice }]
          : [];
      });
      return { kind: "results", query: query.text, hits: hits.slice(0, 10) };
    }
  }
}
