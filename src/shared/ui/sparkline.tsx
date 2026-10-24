type SparklineProps = {
  values: number[];
  label: string;
  filled?: boolean;
};

/** Biểu đồ đường nhỏ trong KPI – SVG thuần, render trên server, không cần JS. */
export function Sparkline({ values, label, filled = false }: SparklineProps) {
  if (values.length < 2) return null;
  const width = 200;
  const height = 34;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const x = (i: number) => (i * width) / (values.length - 1);
  const y = (v: number) => 3 + (height - 6) * (1 - (v - min) / Math.max(1, max - min));
  const points = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");

  return (
    <svg
      className="my-1 block h-[34px] w-full"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={label}
    >
      {filled && <polygon points={`0,${height} ${points} ${width},${height}`} fill="var(--color-accent)" opacity={0.08} />}
      <polyline
        points={points}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth={1.6}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ProgressBar({ value, tone = "accent" }: { value: number; tone?: "accent" | "warn" }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="h-1.5 overflow-hidden rounded-[1px] bg-[#ededf0]" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <i className={tone === "warn" ? "block h-full bg-warn" : "block h-full bg-accent"} style={{ width: `${pct}%` }} />
    </div>
  );
}
