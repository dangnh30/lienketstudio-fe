import type { Deal } from "@/domain/deal";
import { formatVnd } from "@/shared/lib/format";

/** Biểu đồ lịch sử giá 90 ngày – SVG render trên server (bot đọc được, không cần JS). */
export function PriceHistoryChart({ deal }: { deal: Pick<Deal, "priceHistory" | "avg30"> }) {
  const history = deal.priceHistory;
  const min = Math.min(...history, deal.avg30) * 0.97;
  const max = Math.max(...history, deal.avg30) * 1.02;
  const x = (i: number) => 60 + i * (656 / (history.length - 1));
  const y = (v: number) => 200 - ((v - min) / (max - min)) * 170;
  const last = history.length - 1;
  const peak = history.indexOf(Math.max(...history));
  const points = history.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");

  return (
    <figure className="m-0">
      <svg viewBox="0 0 740 240" role="img" aria-label="Lịch sử giá 90 ngày" className="block h-auto w-full font-[inherit]">
        <line x1="56" x2="720" y1={y(deal.avg30)} y2={y(deal.avg30)} stroke="#8A8F96" strokeDasharray="5 5" />
        <text x="62" y={y(deal.avg30) + 16} fontSize="12" fill="#3E434A">
          TB 30 ngày {formatVnd(deal.avg30)}
        </text>
        <polyline fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinejoin="round" points={points} />
        <circle cx={x(peak)} cy={y(history[peak])} r="5" fill="#fff" stroke="#B4400F" strokeWidth="2" />
        <text x={x(peak) + 10} y={y(history[peak]) - 6} fontSize="12" fill="#9A3A0E">
          Đỉnh {formatVnd(history[peak])}
        </text>
        <circle cx={x(last)} cy={y(history[last])} r="6" fill="var(--color-accent)" />
        <text x={x(last) - 10} y={y(history[last]) - 12} textAnchor="end" fontSize="12.5" fontWeight="500" fill="#15171A">
          {formatVnd(history[last])}
        </text>
        <text x="60" y="228" fontSize="12" fill="#5B6068">
          90 ngày trước
        </text>
        <text x="716" y="228" textAnchor="end" fontSize="12" fill="#5B6068">
          Hôm nay
        </text>
      </svg>
      <figcaption className="sr-only">
        Giá trung bình 30 ngày {formatVnd(deal.avg30)}, cao nhất {formatVnd(history[peak])}, hiện tại{" "}
        {formatVnd(history[last])}.
      </figcaption>
    </figure>
  );
}
