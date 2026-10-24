"use server";

import { z } from "zod";
import { bestOffer, priceChangePercent } from "@/domain/deal";
import { PLATFORM_LABEL } from "@/domain/platform";
import { removeDiacritics } from "@/shared/lib/format";
import { requireCustomer } from "@/server/auth/dal";
import { repositories } from "@/server/container";

export type DealSearchResult = {
  id: string;
  name: string;
  platform: string;
  price: number;
  change: number;
  href: string;
};

const norm = (s: string) => removeDiacritics(s).toLowerCase();

/** Tìm nhanh deal trong workspace (không phân biệt dấu) – dùng cho ô tìm kiếm trên topbar */
export async function searchDealsAction(query: string): Promise<DealSearchResult[]> {
  const q = norm(z.string().max(80).parse(query).trim());
  if (!q) return [];
  const { workspaceId } = await requireCustomer();
  const deals = await repositories().deals.listByWorkspace(workspaceId);
  return deals
    .filter((d) => norm(d.name).includes(q))
    .slice(0, 6)
    .map((d) => {
      const o = bestOffer(d);
      return {
        id: d.id,
        name: d.name,
        platform: PLATFORM_LABEL[o.platform],
        price: o.finalPrice,
        change: priceChangePercent(d),
        // Sản phẩm không bị gắn cờ giảm ảo đều có trang so sánh giá công khai
        href: d.flag === "fake" ? "/app/review" : `/deal/${d.slug}`,
      };
    });
}
