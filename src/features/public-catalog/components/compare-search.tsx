"use client";

import { useRouter } from "next/navigation";
import { Check, Search } from "lucide-react";
import { useId, useState, useTransition } from "react";
import type { CompareTarget } from "@/domain/comparison";
import { cn } from "@/shared/lib/cn";
import { formatVnd } from "@/shared/lib/format";
import { Button, buttonVariants } from "@/shared/ui/button";
import { ProductThumb } from "@/shared/ui/product-thumb";
import { searchCatalogAction, type SearchResponse } from "../actions";
import { toggleTarget, useCompareTargets } from "./compare-targets";

const TARGETS: { key: CompareTarget; label: string }[] = [
  { key: "platform", label: "TikTok Shop" },
  { key: "web", label: "Website khác qua Google" },
];

export function CompareTargets() {
  const targets = useCompareTargets();
  const [hint, setHint] = useState<string>();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[13px] text-muted">So sánh với</span>
      {TARGETS.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          aria-pressed={targets[key]}
          onClick={() => setHint(toggleTarget(key) ? undefined : "Chọn ít nhất một nơi để so sánh")}
          className={cn(
            "inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-sm border border-line bg-white pr-3 pl-2 text-[13.5px] text-ink-2",
            targets[key] && "border-accent bg-accent-row text-ink",
          )}
        >
          <span className={cn("inline-flex size-[18px] items-center justify-center rounded-xs border border-[#c9cacf] text-white", targets[key] && "border-accent bg-accent")}>
            {targets[key] && <Check className="size-3" strokeWidth={3} aria-hidden="true" />}
          </span>
          {label}
        </button>
      ))}
      {hint && (
        <span className="text-[13px] text-warn" role="status">
          {hint}
        </span>
      )}
    </div>
  );
}

/**
 * Ô "Dán link Shopee hoặc gõ tên sản phẩm":
 * - link Shopee → mở thẳng trang kết quả
 * - tên sản phẩm → danh sách kết quả trên Shopee để chọn (chỉ ở trang chủ: showResults)
 */
export function CompareSearch({ defaultValue = "", size = "lg", showResults = false }: { defaultValue?: string; size?: "lg" | "md"; showResults?: boolean }) {
  const router = useRouter();
  const inputId = useId();
  const [value, setValue] = useState(defaultValue);
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [pending, startTransition] = useTransition();
  const big = size === "lg";

  const submit = () =>
    startTransition(async () => {
      const res = await searchCatalogAction(value);
      if (res.kind === "redirect") return router.push(`/deal/${res.slug}`);
      if (res.kind === "results" && !showResults) {
        // Ở trang kết quả: một kết quả thì mở luôn, nhiều kết quả thì về trang chủ để chọn
        if (res.hits.length === 1) return router.push(`/deal/${res.hits[0].slug}`);
      }
      setResponse(res);
    });

  const error = response?.kind === "error" ? response.message : undefined;

  return (
    <div className="flex flex-col gap-2">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className={cn(
          "flex items-center gap-2.5 rounded-md border border-line bg-white text-muted focus-within:border-accent focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-accent)_16%,transparent)]",
          big ? "py-2 pr-2 pl-4" : "py-1.5 pr-1.5 pl-3.5",
          error && "border-danger",
        )}
      >
        <label htmlFor={inputId} className="sr-only">
          Link Shopee hoặc tên sản phẩm
        </label>
        <Search className={big ? "size-5 flex-none" : "size-4 flex-none"} aria-hidden="true" />
        <input
          id={inputId}
          type="search"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setResponse(null);
          }}
          placeholder="Dán link sản phẩm Shopee hoặc gõ tên sản phẩm"
          autoComplete="off"
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-err` : undefined}
          className={cn("min-w-0 flex-1 border-0 bg-transparent text-ink outline-none", big ? "min-h-11 text-[16.5px]" : "text-[15px]")}
        />
        <Button type="submit" variant="primary" disabled={pending} className="max-[640px]:px-3">
          {big ? "Tìm sản phẩm" : "Tìm"}
        </Button>
      </form>
      {error && (
        <p id={`${inputId}-err`} className="text-[13px] font-medium text-danger" role="alert">
          {error}
        </p>
      )}
      <CompareTargets />
      {response?.kind === "results" && <SearchResults query={response.query} hits={response.hits} />}
    </div>
  );
}

function SearchResults({ query, hits }: { query: string; hits: Extract<SearchResponse, { kind: "results" }>["hits"] }) {
  const router = useRouter();
  if (!hits.length) {
    return (
      <div className="mt-3 rounded-md border border-line bg-white px-5 py-[18px] text-[13px] text-muted">
        Không tìm thấy &quot;{query}&quot; trên Shopee. Thử tên ngắn hơn, ví dụ chỉ tên hãng và mẫu.
      </div>
    );
  }
  return (
    <section className="mt-3 overflow-hidden rounded-md border border-line bg-white" aria-label="Kết quả tìm kiếm">
      <div className="px-5 pt-[18px] pb-1.5">
        <h2 className="text-base">Kết quả trên Shopee cho &quot;{query}&quot;</h2>
        <p className="text-[13px] text-muted">Chọn đúng sản phẩm bạn định mua</p>
      </div>
      {hits.map((h) => (
        <button
          key={h.id}
          type="button"
          onClick={() => router.push(`/deal/${h.slug}`)}
          className="flex w-full cursor-pointer items-center gap-3 border-0 border-t border-line-2 bg-white px-5 py-3 text-left text-sm text-ink hover:bg-hover"
        >
          <ProductThumb id={h.id} size={48} />
          <span className="min-w-0 flex-1">
            <b className="font-medium">{h.name}</b>
            <span className="block text-[13px] text-muted">
              {h.shop} · đã bán {h.sold}
            </span>
          </span>
          <b className="tnum">{formatVnd(h.price)}</b>
          <span className={buttonVariants({ size: "sm" })}>So sánh</span>
        </button>
      ))}
    </section>
  );
}
