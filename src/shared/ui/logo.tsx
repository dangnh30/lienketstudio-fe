import Link from "next/link";
import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type LogoProps = {
  href: string;
  subtitle?: string;
  icon?: ReactNode;
  tone?: "light" | "dark";
};

export function Logo({ href, subtitle = "Studio", icon, tone = "light" }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 px-2 py-0.5 text-[15.5px] font-semibold no-underline",
        tone === "dark" ? "text-white" : "text-ink",
      )}
    >
      <i
        className={cn(
          "flex size-[30px] flex-none items-center justify-center rounded-sm text-white",
          tone === "dark" ? "bg-[#3f3f46]" : "bg-accent",
        )}
      >
        {icon ?? <Check className="size-[18px]" strokeWidth={2.4} aria-hidden="true" />}
      </i>
      <span className="flex flex-col leading-[1.15]">
        Lienket
        <small className={cn("text-[11.5px] font-medium tracking-[0.02em]", tone === "dark" ? "text-subtle" : "text-muted")}>
          {subtitle}
        </small>
      </span>
    </Link>
  );
}
