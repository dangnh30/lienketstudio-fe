"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { cn } from "@/shared/lib/cn";
import { formatSignedPercent, formatVnd } from "@/shared/lib/format";
import { ProductThumb } from "@/shared/ui/product-thumb";
import { searchDealsAction, type DealSearchResult } from "@/features/deals/search";

const boxClass =
  "relative flex h-9 w-[300px] max-w-[40vw] items-center gap-2 rounded-sm border border-line bg-hover pr-2.5 pl-3 text-muted transition-[border-color,box-shadow] focus-within:border-accent focus-within:bg-white focus-within:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-accent)_16%,transparent)] max-[900px]:w-auto max-[900px]:max-w-none max-[900px]:flex-1";

/** Phím "/" để focus ô tìm kiếm (trừ khi đang gõ trong ô nhập khác) */
function useSlashShortcut(ref: React.RefObject<HTMLInputElement | null>) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName ?? "").toUpperCase();
      if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(tag)) {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [ref]);
}

/** Tìm deal nhanh (khu khách hàng): gõ là hiện kết quả, debounce 200ms */
export function DealSearchBox() {
  const ref = useRef<HTMLInputElement>(null);
  const listId = useId();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DealSearchResult[] | null>(null);
  const [, startTransition] = useTransition();
  useSlashShortcut(ref);

  useEffect(() => {
    if (!query.trim()) return;
    const t = setTimeout(() => startTransition(async () => setResults(await searchDealsAction(query))), 200);
    return () => clearTimeout(t);
  }, [query]);

  const open = query.trim() !== "" && results !== null;
  const close = () => {
    setQuery("");
    setResults(null);
  };

  return (
    <div className={boxClass} role="search" onKeyDown={(e) => e.key === "Escape" && (close(), ref.current?.blur())}>
      <Search className="size-4 flex-none" aria-hidden="true" />
      <input
        ref={ref}
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (!e.target.value.trim()) setResults(null);
        }}
        placeholder="Tìm sản phẩm, deal…"
        autoComplete="off"
        aria-label="Tìm sản phẩm"
        className="h-[34px] min-w-0 flex-1 border-0 bg-transparent text-[13.5px] text-ink outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      <kbd className="rounded-xs border border-b-2 border-line bg-soft px-1.5 py-[3px] text-[11px] leading-none font-medium text-muted max-[900px]:hidden">/</kbd>
      {open && (
        <div id={listId} role="listbox" className="absolute top-11 right-0 left-0 z-45 rounded-md border border-line bg-white p-1.5 shadow-pop">
          {results.length === 0 && <div className="px-3.5 py-3 text-[13px] text-muted">Không tìm thấy sản phẩm</div>}
          {results.map((r) => (
            <Link key={r.id} href={r.href} role="option" aria-selected={false} onClick={close} className="flex items-center gap-2.5 rounded-sm p-2 text-[13.5px] text-ink no-underline hover:bg-soft">
              <ProductThumb id={r.id} size={32} />
              <span className="min-w-0 flex-1">
                <b>{r.name}</b>
                <span className="block text-[13px] text-muted">
                  {r.platform} · {formatVnd(r.price)}
                </span>
              </span>
              <span className={cn("text-[13px] font-medium", r.change < 0 ? "text-accent-ink" : "text-warn")}>{formatSignedPercent(r.change)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/** Tìm khách hàng (khu quản trị): Enter để mở danh sách đã lọc */
export function CustomerSearchBox() {
  const ref = useRef<HTMLInputElement>(null);
  const router = useRouter();
  useSlashShortcut(ref);
  return (
    <form
      role="search"
      className={boxClass}
      onSubmit={(e) => {
        e.preventDefault();
        const q = ref.current?.value.trim() ?? "";
        router.push(q ? `/admin/customers?q=${encodeURIComponent(q)}` : "/admin/customers");
      }}
    >
      <Search className="size-4 flex-none" aria-hidden="true" />
      <input
        ref={ref}
        type="search"
        placeholder="Tìm khách hàng theo tên, email…"
        autoComplete="off"
        aria-label="Tìm khách hàng"
        className="h-[34px] min-w-0 flex-1 border-0 bg-transparent text-[13.5px] text-ink outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      <kbd className="rounded-xs border border-b-2 border-line bg-soft px-1.5 py-[3px] text-[11px] leading-none font-medium text-muted max-[900px]:hidden">↵</kbd>
    </form>
  );
}
