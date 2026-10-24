import Link from "next/link";
import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/cn";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm border font-medium transition-colors active:translate-y-px disabled:pointer-events-none disabled:opacity-45 cursor-pointer",
  {
    variants: {
      variant: {
        default: "border-line bg-white text-ink hover:bg-panel",
        primary: "border-transparent bg-accent text-white shadow-[0_1px_2px_rgb(24_24_27/0.12)] hover:bg-accent-ink",
        danger: "border-danger-line bg-white text-danger hover:bg-[#fef3f2]",
        ghost: "border-transparent bg-transparent text-ink-2 hover:bg-soft",
      },
      size: {
        md: "min-h-9 px-4 text-[13.5px]",
        sm: "min-h-8 px-3 text-[13px]",
        icon: "size-9 p-0",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  },
);

type ButtonVariants = VariantProps<typeof buttonVariants>;

export function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ComponentProps<"button"> & ButtonVariants) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export function ButtonLink({
  className,
  variant,
  size,
  ...props
}: ComponentProps<typeof Link> & ButtonVariants) {
  return <Link className={cn(buttonVariants({ variant, size }), "no-underline", className)} {...props} />;
}
