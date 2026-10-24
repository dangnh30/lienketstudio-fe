const vndFormatter = new Intl.NumberFormat("vi-VN");
const percentFormatter = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 });

/** 1290000 → "1.290.000₫" */
export function formatVnd(value: number) {
  return `${vndFormatter.format(Math.round(value))}₫`;
}

/** 12480 → "12.480" */
export function formatNumber(value: number) {
  return vndFormatter.format(Math.round(value));
}

/** 3.25 → "3,3%" */
export function formatPercent(value: number) {
  return `${percentFormatter.format(value)}%`;
}

/** -18 → "−18%", 5 → "+5%" (dùng cho mức thay đổi giá) */
export function formatSignedPercent(value: number) {
  if (value > 0) return `+${value}%`;
  if (value < 0) return `−${Math.abs(value)}%`;
  return "0%";
}

/** 1_250_000 → "1,3 tr", 14_000 → "14k" (trục biểu đồ) */
export function formatCompact(value: number) {
  if (value >= 1e6) return `${percentFormatter.format(value / 1e6)} tr`;
  if (value >= 1e3) return `${Math.round(value / 1e3)}k`;
  return String(Math.round(value));
}

/** "Nguyễn Minh Anh" → "MA" */
export function initials(name: string, count = 2) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-count)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

/** Bỏ dấu tiếng Việt để tìm kiếm / tạo slug */
export function removeDiacritics(input: string) {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

export function slugify(input: string) {
  return removeDiacritics(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** "2026-10-22" → "22/10" (nhãn trục ngày của biểu đồ) */
export function dayLabel(isoDate: string) {
  const [, m, d] = isoDate.split("-");
  return `${Number(d)}/${Number(m)}`;
}
