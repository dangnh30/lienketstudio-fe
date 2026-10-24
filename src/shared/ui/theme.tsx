"use client";

import { useSyncExternalStore } from "react";
import { cn } from "@/shared/lib/cn";

/* Màu chủ đạo – lưu theo trình duyệt (localStorage), áp bằng [data-accent] trên <html>. */

export const ACCENTS = {
  grayorange: { name: "Xám cam", color: "#D9621F", bg: "#FCEBDF" },
  violet: { name: "Tím", color: "#5B45D6", bg: "#EEEBFC" },
  navy: { name: "Xanh dương đậm", color: "#1E3A8A", bg: "#E6ECF8" },
  crimson: { name: "Đỏ son", color: "#B4233C", bg: "#FBE9EC" },
  amber: { name: "Vàng hổ phách", color: "#A15C07", bg: "#FBF0DF" },
  graphite: { name: "Than chì", color: "#2F3640", bg: "#E9EBEE" },
} as const;

export type Accent = keyof typeof ACCENTS;
const STORAGE_KEY = "lk-accent";
const listeners = new Set<() => void>();

function readAccent(): Accent {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v && v in ACCENTS ? (v as Accent) : "grayorange";
  } catch {
    return "grayorange";
  }
}

export function applyAccent(accent: Accent) {
  if (accent === "grayorange") delete document.documentElement.dataset.accent;
  else document.documentElement.dataset.accent = accent;
  try {
    localStorage.setItem(STORAGE_KEY, accent);
  } catch {
    // Trình duyệt chặn lưu trữ: vẫn áp dụng cho phiên hiện tại
  }
  listeners.forEach((l) => l());
}

/** Script chạy trước khi vẽ trang để không bị nháy màu mặc định */
export const ACCENT_INIT_SCRIPT = `try{var a=localStorage.getItem("${STORAGE_KEY}");if(a&&a!=="grayorange"&&${JSON.stringify(Object.keys(ACCENTS))}.includes(a))document.documentElement.dataset.accent=a}catch(e){}`;

export function AccentInit() {
  return <script dangerouslySetInnerHTML={{ __html: ACCENT_INIT_SCRIPT }} />;
}

export function ThemePicker({ onChange }: { onChange?: (name: string) => void }) {
  const current = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    readAccent,
    () => "grayorange" as Accent,
  );

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
      {(Object.keys(ACCENTS) as Accent[]).map((key) => {
        const t = ACCENTS[key];
        const on = key === current;
        return (
          <button
            key={key}
            type="button"
            aria-pressed={on}
            onClick={() => {
              applyAccent(key);
              onChange?.(t.name);
            }}
            className={cn(
              "flex cursor-pointer flex-col gap-2.5 rounded-md border border-line bg-white p-2.5 text-left transition-[border-color,box-shadow] hover:border-[#d4d4d8]",
              on && "border-accent shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-accent)_18%,transparent)]",
            )}
          >
            <span className="flex h-[72px] overflow-hidden rounded-sm border border-line-2" aria-hidden="true">
              <span className="flex w-[34%] flex-col gap-[5px] border-r border-line-2 bg-panel px-1.5 py-2">
                <i className="block h-1.5 rounded-xs bg-line" />
                <i className="block h-1.5 rounded-xs" style={{ background: t.bg, boxShadow: `inset 2px 0 0 ${t.color}` }} />
                <i className="block h-1.5 rounded-xs bg-line" />
              </span>
              <span className="flex flex-1 flex-col gap-1.5 px-2 py-[9px]">
                <i className="block h-3 w-11 rounded-xs" style={{ background: t.color }} />
                <i className="block h-[5px] rounded-xs bg-[#ececef]" />
                <i className="block h-[5px] w-3/5 rounded-xs bg-[#ececef]" />
              </span>
            </span>
            <span className="flex items-center gap-2 text-[13.5px] font-medium">
              <span className="size-3 flex-none rounded-full" style={{ background: t.color }} />
              {t.name}
              {key === "grayorange" && <span className="ml-auto text-[13px] font-normal text-muted">Mặc định</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
