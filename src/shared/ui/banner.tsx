import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

const tones = {
  warn: "border-warn-line bg-warn-row",
  info: "border-[#cfe0fb] bg-[#eef4ff]",
  impersonate: "border-[#f3d9a4] bg-[#fff7e6]",
  success: "border-[#cbebd7] bg-[#f0faf4]",
} as const;

export function Banner({
  tone = "warn",
  children,
  action,
}: {
  tone?: keyof typeof tones;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-wrap items-center justify-between gap-2.5 rounded-md border px-4 py-3 text-sm",
        tones[tone],
      )}
    >
      <span>{children}</span>
      {action}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="px-5 py-[18px] text-muted">{children}</div>;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-soft", className)} aria-hidden="true" />;
}
