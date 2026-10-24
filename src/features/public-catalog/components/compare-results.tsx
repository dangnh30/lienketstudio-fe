"use client";

import { cheapestOption, isSameProduct, type Comparison } from "@/domain/comparison";
import { PLATFORM_LABEL } from "@/domain/platform";
import { cn } from "@/shared/lib/cn";
import { formatVnd } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/badge";
import { buttonVariants } from "@/shared/ui/button";
import { affiliateUrl } from "./affiliate-link";
import { useCompareTargets } from "./compare-targets";

/*
 * Kết luận + các nơi bán khác. Toàn bộ nội dung đã render sẵn trên server (SEO);
 * phía trình duyệt chỉ ẩn/hiện theo lựa chọn "So sánh với" và tính lại nơi rẻ nhất.
 */

function Diff({ price, base }: { price: number; base: number }) {
  const v = price - base;
  if (v === 0) return <span className="text-muted">bằng giá</span>;
  return <span className={v < 0 ? "font-medium text-success" : "text-muted"}>{v < 0 ? "rẻ hơn " : "đắt hơn "}{formatVnd(Math.abs(v))}</span>;
}

const rowClass = "flex flex-wrap items-center gap-3 border-t border-line-2 px-5 py-3 text-sm max-[640px]:gap-x-3 max-[640px]:gap-y-2";

export function CompareResults({ comparison, dealId }: { comparison: Comparison; dealId: string }) {
  const targets = useCompareTargets();
  const verdict = cheapestOption(comparison, targets, PLATFORM_LABEL);
  const { source, other, websites } = comparison;
  const sourceLabel = PLATFORM_LABEL[source.platform];
  const otherLabel = PLATFORM_LABEL[other.platform];
  const sameOnOther = other.candidates.filter(isSameProduct);
  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(comparison.searchTerm)}`;

  return (
    <>
      <div className={cn("flex flex-col gap-0.5 rounded-md border px-[18px] py-3.5 text-sm", verdict.sourceIsCheapest ? "border-line bg-panel" : "border-accent-soft bg-accent-row")} role="status">
        {verdict.sourceIsCheapest ? (
          <>
            <b className="text-[17px] font-semibold">
              {sourceLabel} đang rẻ nhất: {formatVnd(source.price)}
            </b>
            <span className="text-ink-2">Không nơi nào bạn chọn bán cùng sản phẩm rẻ hơn.</span>
          </>
        ) : (
          <>
            <b className="text-[17px] font-semibold">
              Rẻ nhất ở {verdict.where}: {formatVnd(verdict.price)}
            </b>
            <span className="text-ink-2">
              Rẻ hơn {sourceLabel} {formatVnd(verdict.saving)} ({verdict.savingPercent}%). Kiểm tra lại phí vận chuyển và mã giảm giá trước khi mua.
            </span>
          </>
        )}
      </div>

      {targets.platform && (
        <section className="overflow-hidden rounded-md border border-line bg-white">
          <div className="px-5 pt-[18px] pb-2">
            <h2 className="text-base">Trên {otherLabel}</h2>
            <p className="text-[13px] text-muted">Ghép theo tên và mã model. Kiểm tra màu, phiên bản trước khi mua.</p>
          </div>
          {sameOnOther.length === 0 && <p className="px-5 pb-2.5 text-[13px] text-warn">Chưa tìm thấy đúng sản phẩm này trên {otherLabel}. Dưới đây là sản phẩm gần giống.</p>}
          {other.candidates.map((c) => {
            const same = isSameProduct(c);
            return (
              <div key={c.title} className={rowClass}>
                <Badge tone={same ? "ok" : "neutral"} className="max-[640px]:order-first">
                  {same ? "Cùng sản phẩm" : "Gần giống"}
                </Badge>
                <span className="min-w-0 flex-1 max-[640px]:basis-full">
                  <b className="font-medium">{c.title}</b>
                  <span className="block text-[13px] text-muted">
                    {c.shop} · đã bán {c.sold} · {c.note}
                  </span>
                </span>
                <span className="flex min-w-[120px] flex-col items-end text-[13px] max-[640px]:min-w-0 max-[640px]:flex-row max-[640px]:items-baseline max-[640px]:gap-2">
                  <b className="text-[15px] tnum">{formatVnd(c.price)}</b>
                  {same ? <Diff price={c.price} base={source.price} /> : <span className="text-muted">khác sản phẩm</span>}
                </span>
                <a href={affiliateUrl({ id: dealId }, other.platform)} rel="sponsored nofollow noopener" target="_blank" className={buttonVariants({ size: "sm", className: "no-underline max-[640px]:ml-auto" })}>
                  Xem trên {otherLabel}
                </a>
              </div>
            );
          })}
        </section>
      )}

      {targets.web && (
        <section className="overflow-hidden rounded-md border border-line bg-white">
          <div className="px-5 pt-[18px] pb-2">
            <h2 className="text-base">Trên các website khác</h2>
            <p className="text-[13px] text-muted">Tìm qua Google trong danh sách website bán lẻ đã chọn. Giá do website công bố, có thể đã đổi.</p>
          </div>
          {websites.map((w) => (
            <div key={w.name} className={rowClass}>
              <span className="flex size-8 flex-none items-center justify-center rounded-sm bg-soft text-[13px] font-semibold text-ink-2" aria-hidden="true">
                {w.name.charAt(0)}
              </span>
              <span className="min-w-0 flex-1 max-[640px]:basis-[calc(100%-50px)]">
                <b className="font-medium">{w.name}</b>
                <span className="block text-[13px] text-muted">
                  {w.title} · {w.domain}
                </span>
              </span>
              <span className="flex min-w-[120px] flex-col items-end text-[13px] max-[640px]:min-w-0 max-[640px]:flex-row max-[640px]:items-baseline max-[640px]:gap-2">
                <b className="text-[15px] tnum">{formatVnd(w.price)}</b>
                <Diff price={w.price} base={source.price} />
              </span>
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(`${w.title} site:${w.domain}`)}`}
                rel="nofollow noopener"
                target="_blank"
                className={buttonVariants({ size: "sm", className: "no-underline max-[640px]:ml-auto" })}
              >
                Mở trang
              </a>
            </div>
          ))}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line-2 px-5 py-3">
            <span className="text-[13px] text-muted">Không thấy website bạn hay mua?</span>
            <a href={googleUrl} rel="nofollow noopener" target="_blank" className={buttonVariants({ size: "sm", className: "no-underline" })}>
              Tìm &quot;{comparison.searchTerm}&quot; trên Google
            </a>
          </div>
        </section>
      )}
    </>
  );
}
