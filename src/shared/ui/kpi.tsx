import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

/** Dải KPI liền khối, chia bằng đường mảnh (theo mockup). */
export function KpiStrip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-px overflow-hidden rounded-md border border-line bg-line min-[481px]:grid-cols-2 min-[1101px]:grid-cols-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

type KpiProps = {
  label: string;
  icon?: ReactNode;
  iconTone?: "default" | "warn";
  value: ReactNode;
  unit?: string;
  chart?: ReactNode;
  footer?: ReactNode;
  href?: string;
};

export function Kpi({ label, icon, iconTone = "default", value, unit, chart, footer, href }: KpiProps) {
  const body = (
    <>
      <div className="flex items-center justify-between text-[13px] font-medium text-muted">
        <span>{label}</span>
        {icon && <span className={cn("text-subtle", iconTone === "warn" && "text-warn")}>{icon}</span>}
      </div>
      <b className="text-[26px] leading-[1.15] font-semibold tracking-[-0.025em] tnum">
        {value}
        {unit && <small className="text-sm font-medium tracking-normal text-muted"> {unit}</small>}
      </b>
      {chart}
      {footer}
    </>
  );
  const className = "flex flex-col gap-1 bg-white px-[18px] pt-4 pb-3.5 text-ink no-underline";
  return href ? (
    <Link href={href} className={cn(className, "hover:bg-[#fcfcfc]")}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

export function Delta({ value, suffix }: { value: number; suffix: string }) {
  const up = value >= 0;
  return (
    <span className={cn("text-[12.5px]", up ? "text-success" : "text-danger")}>
      {up ? "↑ " : "↓ "}
      {Math.abs(value)}% {suffix}
    </span>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return <span className="text-[12.5px] text-muted">{children}</span>;
}
