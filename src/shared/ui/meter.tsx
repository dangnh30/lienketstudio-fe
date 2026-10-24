import { formatNumber } from "@/shared/lib/format";
import { ProgressBar } from "./sparkline";

/** Mức sử dụng so với giới hạn gói; ≥ 90% chuyển màu cảnh báo */
export function Meter({ label, used, limit, unit }: { label: string; used: number; limit: number; unit?: string }) {
  const pct = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-[13px]">
        <span>{label}</span>
        <span className="tnum">
          {formatNumber(used)} / {formatNumber(limit)}
          {unit ? ` ${unit}` : ""}
        </span>
      </div>
      <ProgressBar value={pct} tone={pct >= 90 ? "warn" : "accent"} />
    </div>
  );
}

export function MeterGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[18px]">{children}</div>;
}
