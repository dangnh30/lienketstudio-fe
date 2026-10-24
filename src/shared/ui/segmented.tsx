import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

/** Nhóm tab dạng "segmented control". Mỗi mục là một link => URL là nguồn sự thật, SSR được. */
export function Segmented({ children, label }: { children: ReactNode; label: string }) {
  return (
    <nav
      aria-label={label}
      className="inline-flex max-w-full flex-wrap gap-0.5 self-start rounded-sm bg-soft p-[3px]"
    >
      {children}
    </nav>
  );
}

type SegmentProps = {
  href: string;
  active: boolean;
  children: ReactNode;
};

export function Segment({ href, active, children }: SegmentProps) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex min-h-[30px] items-center gap-1.5 rounded-sm px-3 text-[13px] font-medium text-muted no-underline transition-colors hover:text-ink",
        active && "bg-white text-ink shadow-[0_0_0_1px_var(--color-line),0_1px_2px_rgb(24_24_27/0.05)]",
      )}
    >
      {children}
    </Link>
  );
}
