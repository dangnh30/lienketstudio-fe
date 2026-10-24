import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-[3px] px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      tone: {
        neutral: "bg-soft text-ink-2",
        ok: "bg-accent-bg text-accent-ink before:size-1.5 before:rounded-full before:bg-current before:opacity-85",
        warn: "bg-warn-bg text-warn before:size-1.5 before:rounded-full before:bg-current before:opacity-85",
        shopee: "bg-shopee text-white",
        tiktok: "bg-tiktok-bg text-tiktok",
        fb: "bg-fb-bg text-fb",
        locked: "bg-soft text-[#52525b] line-through",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>["tone"]>;

export function Badge({ className, tone, ...props }: ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

/** Bộ đếm nhỏ cạnh menu / tab */
export function Count({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex h-[19px] min-w-5 items-center justify-center rounded-xs px-1.5 text-[11.5px] font-medium tnum",
        className,
      )}
      {...props}
    />
  );
}
