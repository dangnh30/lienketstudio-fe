import type { ReactNode } from "react";
import { formatCompact } from "@/shared/lib/format";

/*
 * Biểu đồ SVG render trên server: không tốn JS, bot đọc được.
 * Tooltip dùng <title> gốc của SVG (hiện khi rê chuột, trình đọc màn hình đọc được);
 * luôn kèm <DataTableDetails> để xem số liệu dạng bảng.
 */

const AXIS = "#7A7E87";
const GRID = "#ECECEF";

type Series = { values: number[]; name: string };

type LineChartProps = {
  primary: Series;
  /** Đường thứ hai (nét đứt, xám) để so sánh */
  secondary?: Series;
  labels: string[];
  format: (v: number) => string;
  width?: number;
};

export function LineChart({ primary, secondary, labels, format, width = 1000 }: LineChartProps) {
  const H = width < 800 ? 240 : 280;
  const L = 52, R = 16, T = 16, B = 30;
  const n = primary.values.length;
  const max = Math.max(...primary.values, ...(secondary?.values ?? [])) * 1.15 || 1;
  const x = (i: number) => L + (i * (width - L - R)) / Math.max(1, n - 1);
  const y = (v: number) => T + (H - T - B) * (1 - v / max);
  const pts = (vals: number[]) => vals.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const step = Math.ceil(n / 7);
  const hw = (width - L - R) / Math.max(1, n - 1);

  return (
    <svg viewBox={`0 0 ${width} ${H}`} role="img" aria-label={`${primary.name} theo ngày`} className="block h-auto w-full">
      {[0, 0.25, 0.5, 0.75, 1].map((f) => (
        <g key={f}>
          <line x1={L} x2={width - R} y1={y(max * f)} y2={y(max * f)} stroke={GRID} />
          <text x={L - 8} y={y(max * f) + 4} textAnchor="end" fontSize="11" fill={AXIS}>
            {formatCompact(max * f)}
          </text>
        </g>
      ))}
      {secondary ? (
        <polyline points={pts(secondary.values)} fill="none" stroke="#A1A1AA" strokeWidth="2" strokeDasharray="5 4" strokeLinejoin="round" />
      ) : (
        <polygon points={`${L},${y(0)} ${pts(primary.values)} ${x(n - 1)},${y(0)}`} fill="var(--color-accent)" opacity={0.1} />
      )}
      <polyline points={pts(primary.values)} fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {!secondary && <circle cx={x(n - 1)} cy={y(primary.values[n - 1])} r="4.5" fill="var(--color-accent)" stroke="#fff" strokeWidth="2" />}
      {labels.map((label, i) =>
        (i % step === 0 || i === n - 1) && !(i !== n - 1 && n - 1 - i < step * 0.6) ? (
          <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill={AXIS}>
            {label}
          </text>
        ) : null,
      )}
      {primary.values.map((v, i) => (
        <rect key={i} x={x(i) - hw / 2} y={T} width={hw} height={H - T - B} fill="transparent" className="hover:fill-black/[0.03]">
          <title>
            {`${labels[i]} · ${primary.name}: ${format(v)}${secondary ? ` · ${secondary.name}: ${format(secondary.values[i])}` : ""}`}
          </title>
        </rect>
      ))}
    </svg>
  );
}

type ColumnChartProps = {
  values: number[];
  labels: string[];
  format: (v: number) => string;
  name: string;
  /** Tô đậm N cột cao nhất */
  highlightTop?: number;
  width?: number;
};

export function ColumnChart({ values, labels, format, name, highlightTop = 0, width = 520 }: ColumnChartProps) {
  const H = 210, L = 8, R = 8, T = 22, B = 26;
  const max = Math.max(...values) * 1.1 || 1;
  const bw = (width - L - R) / values.length;
  const gap = Math.max(2, bw * 0.28);
  const top = [...values].sort((a, b) => b - a).slice(0, highlightTop);

  return (
    <svg viewBox={`0 0 ${width} ${H}`} role="img" aria-label={name} className="block h-auto w-full">
      <line x1={L} x2={width - R} y1={H - B} y2={H - B} stroke="#DCDCE0" />
      {values.map((v, i) => {
        const h = ((H - T - B) * v) / max;
        const bx = L + i * bw + gap / 2;
        const w = bw - gap;
        const hot = top.includes(v);
        return (
          <g key={i}>
            <title>{`${name} · ${labels[i] || i + 1}: ${format(v)}`}</title>
            <rect x={L + i * bw} y={T} width={bw} height={H - T - B} fill="transparent" />
            <rect x={bx} y={H - B - h} width={w} height={h} rx={1.5} fill={hot ? "var(--color-accent)" : "var(--color-accent-soft)"} className="hover:brightness-95" />
            {hot && (
              <text x={bx + w / 2} y={H - B - h - 6} textAnchor="middle" fontSize="11" fontWeight="500" fill="#3D4047">
                {format(v)}
              </text>
            )}
          </g>
        );
      })}
      {labels.map((label, i) => (
        <text key={i} x={L + i * bw + bw / 2} y={H - 8} textAnchor="middle" fontSize="11" fill={AXIS}>
          {label}
        </text>
      ))}
    </svg>
  );
}

export type BarRow = { label: string; value: number; note?: ReactNode; color?: string };

/** Thanh ngang so sánh (nguồn, thiết bị, khu vực...) – thanh lớn nhất tô màu chủ đạo */
export function HBars({ rows, format }: { rows: BarRow[]; format: (v: number) => string }) {
  const max = Math.max(...rows.map((r) => r.value)) || 1;
  return (
    <div className="flex flex-col gap-3.5">
      {rows.map((r) => (
        <div key={r.label} className="flex flex-col gap-1.5" title={`${r.label}: ${format(r.value)}`}>
          <div className="flex justify-between gap-3 text-[13.5px]">
            <span>{r.label}</span>
            <b className="tnum">{format(r.value)}</b>
          </div>
          <div className="h-2.5 overflow-hidden rounded-[1px] bg-[#efeff2]">
            <i
              className="block h-full rounded-[1px]"
              style={{ width: `${Math.max(1.5, (r.value / max) * 100)}%`, background: r.color ?? (r.value === max ? "var(--color-accent)" : "var(--color-accent-soft)") }}
            />
          </div>
          {r.note && <span className="text-[13px] text-muted">{r.note}</span>}
        </div>
      ))}
    </div>
  );
}

/** Phễu lọc: mỗi bước là số còn lại sau vòng lọc, kèm % giữ lại so với bước trước */
export function Funnel({ steps, format, highlightFrom = Infinity }: { steps: { label: string; value: number }[]; format: (v: number) => string; highlightFrom?: number }) {
  const first = steps[0]?.value || 1;
  return (
    <ol className="mt-2.5 flex flex-col gap-1">
      {steps.map((s, i) => (
        <li key={s.label} className="flex items-end gap-3 rounded-sm px-1.5 py-2 hover:bg-soft">
          <span className="flex size-6 flex-none items-center justify-center rounded-sm bg-soft text-xs font-semibold text-muted">{i + 1}</span>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex justify-between gap-3 text-[13.5px]">
              <span>{s.label}</span>
              <b className="tnum">{format(s.value)}</b>
            </div>
            <div className="h-2.5 overflow-hidden rounded-[1px] bg-[#efeff2]">
              <i
                className="block h-full"
                style={{ width: `${Math.max(1.5, (s.value / first) * 100)}%`, background: i >= highlightFrom ? "var(--color-accent)" : "var(--color-accent-soft)" }}
              />
            </div>
          </div>
          <span className="w-[74px] flex-none text-right text-[12.5px] text-muted max-[640px]:w-14">
            {i > 0 && steps[i - 1].value ? `giữ ${Math.round((s.value / steps[i - 1].value) * 100)}%` : ""}
          </span>
        </li>
      ))}
    </ol>
  );
}

/** "Xem dạng bảng" – phương án thay thế dễ tiếp cận cho biểu đồ */
export function DataTableDetails({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <details className="mt-3 text-[13.5px]">
      <summary className="w-max cursor-pointer font-medium text-muted">Xem dạng bảng</summary>
      <div className="mt-2 max-h-[260px] overflow-auto rounded-md border border-line">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {head.map((h) => (
                <th key={h} className="sticky top-0 border-b border-line bg-hover px-3.5 py-2 text-left text-[12.5px] font-medium text-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                {r.map((c, j) => (
                  <td key={j} className="border-b border-line-2 px-3.5 py-2 tnum">
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

export function Legend({ items }: { items: { label: string; dashed?: boolean }[] }) {
  return (
    <div className="flex gap-4 text-[13px] text-ink-2">
      {items.map((it) => (
        <span key={it.label} className="inline-flex items-center gap-[7px]">
          <i className={it.dashed ? "inline-block w-4 border-t-2 border-dashed border-subtle" : "inline-block w-4 border-t-2 border-accent"} />
          {it.label}
        </span>
      ))}
    </div>
  );
}
