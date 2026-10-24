import type { Comparison } from "@/domain/comparison";
import { offerOn, type Deal } from "@/domain/deal";
import { PLATFORM_LABEL } from "@/domain/platform";

/* Kết quả so sánh mẫu – cùng công thức với design/mockup.html (cmpData) */

const round1k = (v: number) => Math.round(v / 1000) * 1000;

export function simulateComparison(deal: Deal): Comparison {
  const sourcePlatform = offerOn(deal, "shopee") ? "shopee" : "tiktokshop";
  const otherPlatform = sourcePlatform === "shopee" ? "tiktokshop" : "shopee";
  const src = offerOn(deal, sourcePlatform)!;
  const other = offerOn(deal, otherPlatform);
  const short = deal.name.replace(/\s*\[.*\]\s*/, "").trim();
  const model = deal.name.match(/\[(.*)\]/)?.[1] ?? "";
  const otherLabel = PLATFORM_LABEL[otherPlatform];

  const candidates = other
    ? [
        { confidence: 96, title: `${short} ${model} chính hãng`, shop: `[Shop ${otherLabel} 1]`, price: other.finalPrice, sold: "1,2k", note: "Trùng mã model và tên" },
        { confidence: 71, title: `${short} ${model} bản Lite`, shop: `[Shop ${otherLabel} 2]`, price: round1k(other.finalPrice * 0.82), sold: "640", note: "Cùng hãng, khác phiên bản" },
      ]
    : [
        { confidence: 64, title: `${short} cùng phân khúc`, shop: `[Shop ${otherLabel} 3]`, price: round1k(src.finalPrice * 0.9), sold: "310", note: "Chỉ giống tên, khác mã model" },
        { confidence: 58, title: `${short} loại phổ thông`, shop: `[Shop ${otherLabel} 4]`, price: round1k(src.finalPrice * 0.7), sold: "2,1k", note: "Khác hãng" },
      ];

  const websites = (
    [
      ["Tiki", "tiki.vn", 1.04],
      ["Lazada", "lazada.vn", 0.99],
      ["CellphoneS", "cellphones.com.vn", 1.07],
      ["Website hãng", "[website hãng]", 1.15],
    ] as const
  ).map(([name, domain, k]) => ({ name, domain, price: round1k(src.finalPrice * k), title: `${short} ${model}` }));

  return {
    source: { platform: sourcePlatform, price: src.finalPrice, coupon: src.coupon, checkedAt: src.checkedAt, shop: `[Tên shop ${PLATFORM_LABEL[sourcePlatform]}]` },
    other: { platform: otherPlatform, candidates },
    websites,
    searchTerm: `${short} ${model}`.trim(),
  };
}
