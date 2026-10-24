import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

export function TableScroll({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("relative overflow-x-auto", className)} {...props} />;
}

export function Table({ className, ...props }: ComponentProps<"table">) {
  return <table className={cn("w-full border-collapse text-sm", className)} {...props} />;
}

export function Th({ className, align, ...props }: ComponentProps<"th"> & { align?: "left" | "right" }) {
  return (
    <th
      className={cn(
        "border-b border-line bg-hover px-3.5 py-[11px] text-left text-[12.5px] font-medium text-muted",
        align === "right" && "text-right",
        className,
      )}
      {...props}
    />
  );
}

export function Td({ className, align, ...props }: ComponentProps<"td"> & { align?: "left" | "right" }) {
  return (
    <td
      className={cn(
        "border-b border-line-2 px-3.5 py-[13px] align-middle [tr:last-child_&]:border-b-0",
        align === "right" && "text-right tnum",
        className,
      )}
      {...props}
    />
  );
}

export function Tr({ className, tone, ...props }: ComponentProps<"tr"> & { tone?: "flag" | "dim" | "best" }) {
  return (
    <tr
      className={cn(
        "transition-colors hover:bg-hover",
        tone === "flag" && "bg-warn-row hover:bg-warn-row",
        tone === "dim" && "bg-[#fafbf9] text-muted",
        tone === "best" && "bg-accent-row hover:bg-accent-row",
        className,
      )}
      {...props}
    />
  );
}
