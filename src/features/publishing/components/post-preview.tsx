import { Check } from "lucide-react";
import { bestOffer, priceChangePercent, type Deal } from "@/domain/deal";
import { PLATFORM_LABEL } from "@/domain/platform";
import { composePostText } from "@/domain/publishing";
import { formatVnd } from "@/shared/lib/format";

/** Xem trước bài Facebook Page như người theo dõi sẽ thấy */
export function FacebookPostPreview({ deal, disclosure }: { deal: Deal; disclosure: string }) {
  const offer = bestOffer(deal);
  return (
    <article className="overflow-hidden rounded-md border border-line bg-white">
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <span className="flex size-9 items-center justify-center rounded-full bg-accent text-white">
          <Check className="size-[18px]" strokeWidth={2.4} aria-hidden="true" />
        </span>
        <div>
          <b className="text-sm">[Tên Page]</b>
          <div className="text-[13px] text-muted">Đã lên lịch · Công khai</div>
        </div>
      </div>
      <p className="px-3 pb-2.5 text-sm whitespace-pre-line">{composePostText(deal, disclosure)}</p>
      <div className="relative flex h-[200px] items-center justify-center bg-gradient-to-br from-[#f7e6da] to-[#efd5c4] text-[13px] text-muted">
        <span className="absolute top-3 left-3 rounded-sm bg-accent px-2.5 py-1 text-[13px] font-semibold text-white">
          {priceChangePercent(deal)}%
        </span>
        [Ảnh thẻ deal]
        <span className="absolute right-3 bottom-3 rounded-sm bg-white px-3 py-1.5 text-base font-semibold text-ink tnum">
          {formatVnd(offer.finalPrice)}
        </span>
      </div>
      <div className="flex justify-between border-t border-line-2 px-3 py-2.5 text-[13px]">
        <span className="text-muted">LINK AFFILIATE · {PLATFORM_LABEL[offer.platform].toUpperCase()}</span>
        <b>Mua ngay</b>
      </div>
    </article>
  );
}
