"use client";

import { useSyncExternalStore } from "react";
import type { CompareTarget } from "@/domain/comparison";

/*
 * Lựa chọn "So sánh với" (TikTok Shop / website khác) – lưu sessionStorage để giữ nguyên
 * khi chuyển từ trang chủ sang trang kết quả. Trang vẫn tĩnh vì không dùng searchParams.
 */

type Targets = Record<CompareTarget, boolean>;
const KEY = "lk-compare-targets";
const DEFAULT: Targets = { platform: true, web: true };
const listeners = new Set<() => void>();
let cache: Targets | null = null;

function read(): Targets {
  if (cache) return cache;
  try {
    const parsed = JSON.parse(sessionStorage.getItem(KEY) ?? "null");
    cache = parsed && (parsed.platform || parsed.web) ? { platform: !!parsed.platform, web: !!parsed.web } : DEFAULT;
  } catch {
    cache = DEFAULT;
  }
  return cache;
}

/** Bật/tắt một nơi so sánh. Trả false nếu đây là lựa chọn cuối cùng (phải còn ít nhất một). */
export function toggleTarget(target: CompareTarget): boolean {
  const current = read();
  const next = { ...current, [target]: !current[target] };
  if (!next.platform && !next.web) return false;
  cache = next;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Trình duyệt chặn lưu trữ: vẫn dùng được trong trang hiện tại
  }
  listeners.forEach((l) => l());
  return true;
}

export function useCompareTargets(): Targets {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => DEFAULT,
  );
}
