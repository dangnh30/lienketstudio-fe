"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { cn } from "@/shared/lib/cn";
import { Count } from "@/shared/ui/badge";
import { ADMIN_NAV, CUSTOMER_NAV, findActiveItem, type NavCountKey } from "../nav";

// Cấu hình menu import trực tiếp ở client (icon là component, không serialize qua props được)
const NAVS = { customer: CUSTOMER_NAV, admin: ADMIN_NAV } as const;
export type NavKind = keyof typeof NAVS;

type SidebarNavProps = {
  nav: NavKind;
  counts?: Partial<Record<NavCountKey, number>>;
  tone: "light" | "dark";
  label: string;
};

/*
 * usePathname() là dữ liệu theo request trên route động => phải nằm trong Suspense.
 * Static shell render menu chưa đánh dấu mục active, rồi mục active stream vào sau.
 * Suspense đóng gói sẵn ở đây để nơi dùng không phải nhớ.
 */
export function SidebarNav(props: SidebarNavProps) {
  return (
    <Suspense fallback={<NavList {...props} pathname={null} />}>
      <ActiveSidebarNav {...props} />
    </Suspense>
  );
}

function ActiveSidebarNav(props: SidebarNavProps) {
  return <NavList {...props} pathname={usePathname()} />;
}

function NavList({ nav, counts = {}, tone, label, pathname }: SidebarNavProps & { pathname: string | null }) {
  const groups = NAVS[nav];
  const active = pathname ? findActiveItem(groups, pathname) : undefined;
  const dark = tone === "dark";

  return (
    <nav aria-label={label} className="flex flex-col gap-0.5 max-[900px]:flex-row max-[900px]:gap-1 max-[900px]:overflow-x-auto max-[900px]:[scrollbar-width:none]">
      {groups.map((group) => (
        <div key={group.label} className="contents">
          <span
            className={cn(
              "px-2.5 pt-4 pb-1 text-xs font-medium first:pt-0.5 max-[900px]:hidden",
              dark ? "text-[#71717a]" : "text-subtle",
            )}
          >
            {group.label}
          </span>
          {group.items.map((item) => {
            const isActive = item === active;
            const count = item.countKey ? counts[item.countKey] : undefined;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group flex min-h-[34px] flex-none items-center gap-[11px] rounded-sm px-2.5 text-[13.5px] font-medium no-underline transition-colors",
                  dark
                    ? "text-[#c4c4cc] hover:bg-white/5 hover:text-white"
                    : "text-[#52525b] hover:bg-[#eeeef0] hover:text-ink",
                  isActive &&
                    (dark
                      ? "bg-white/10 text-white"
                      : "bg-white text-ink shadow-[0_0_0_1px_var(--color-line),0_1px_2px_rgb(24_24_27/0.04)]"),
                )}
              >
                <Icon
                  className={cn("size-[18px] flex-none", isActive ? "text-accent" : dark ? "text-[#8b8b94]" : "text-subtle")}
                  strokeWidth={1.9}
                  aria-hidden="true"
                />
                <span className="flex-1">{item.label}</span>
                {count ? (
                  <Count
                    className={cn(
                      isActive ? "bg-accent-bg text-accent-ink" : dark ? "bg-white/10 text-[#e4e4e7]" : "bg-[#e9e9ec] text-[#52525b]",
                      isActive && dark && "bg-accent text-white",
                    )}
                  >
                    {count}
                  </Count>
                ) : null}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

/** Breadcrumb lấy theo mục menu đang active */
export function Crumb({ nav, root }: { nav: NavKind; root: string }) {
  return (
    <Suspense fallback={<CrumbView root={root} />}>
      <ActiveCrumb nav={nav} root={root} />
    </Suspense>
  );
}

function ActiveCrumb({ nav, root }: { nav: NavKind; root: string }) {
  return <CrumbView root={root} label={findActiveItem(NAVS[nav], usePathname())?.label} />;
}

function CrumbView({ root, label }: { root: string; label?: string }) {
  const active = label ? { label } : undefined;
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2 text-[13.5px] whitespace-nowrap max-[900px]:hidden">
      <span className="text-subtle">{root}</span>
      <span className="text-[#c4c6cc]">/</span>
      <b className="font-semibold">{active?.label}</b>
    </div>
  );
}
