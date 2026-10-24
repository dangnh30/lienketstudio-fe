export const PERFORMANCE_TABS = { revenue: "Doanh thu và đơn", posts: "Bài đăng và kênh", filter: "Bộ lọc deal" } as const;
export type PerformanceTab = keyof typeof PERFORMANCE_TABS;

export const RANGES = [7, 30, 90] as const;
export type Range = (typeof RANGES)[number];
export const DEFAULT_RANGE: Range = 30;

/** Đọc khoảng thời gian từ searchParams, giá trị lạ thì dùng mặc định */
export function parseRange(value: string | string[] | undefined): Range {
  const n = Number(Array.isArray(value) ? value[0] : value);
  return (RANGES as readonly number[]).includes(n) ? (n as Range) : DEFAULT_RANGE;
}


export function percentChange(current: number, previous: number) {
  return previous ? Math.round(((current - previous) / previous) * 100) : 0;
}

export { dayLabel } from "@/shared/lib/format";
