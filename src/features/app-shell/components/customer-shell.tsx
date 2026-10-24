import Link from "next/link";
import { Globe } from "lucide-react";
import { Suspense, type ReactNode } from "react";
import { initials } from "@/shared/lib/format";
import { Banner } from "@/shared/ui/banner";
import { Button } from "@/shared/ui/button";
import { exitImpersonationAction } from "@/features/auth/actions";
import { Logo } from "@/shared/ui/logo";
import { getCustomerShell } from "../server/queries";
import { AppFrame } from "./app-frame";
import { NotificationBell } from "./notification-bell";
import { DealSearchBox } from "./search-box";
import { Crumb, SidebarNav } from "./sidebar-nav";
import { UserMenu } from "./user-menu";

/*
 * Phần tĩnh (logo, menu, breadcrumb) render ngay trong static shell.
 * Phần theo phiên (bộ đếm, thông báo, tài khoản) stream vào sau qua Suspense.
 */
export function CustomerShell({ children }: { children: ReactNode }) {
  return (
    <AppFrame
      tone="light"
      logo={<Logo href="/app" />}
      nav={
        // Fallback: menu chưa có bộ đếm; bộ đếm theo phiên stream vào sau
        <Suspense fallback={<SidebarNav nav="customer" tone="light" label="Lienket Studio" />}>
          <CustomerNav />
        </Suspense>
      }
      sidebarFooter={
        <>
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-sm border border-line bg-white p-2.5 text-[13px] font-medium text-ink-2 no-underline hover:bg-hover hover:text-ink"
          >
            <Globe className="size-4 text-subtle" aria-hidden="true" />
            <span className="flex-1">Về trang chủ</span>
          </Link>
          <Suspense fallback={<div className="h-[51px]" />}>
            <WorkspaceCard />
          </Suspense>
        </>
      }
      topbar={
        <>
          <Crumb nav="customer" root="Lienket Studio" />
          <DealSearchBox />
          <Suspense fallback={<div className="size-9" />}>
            <TopbarActions />
          </Suspense>
        </>
      }
    >
      <Suspense fallback={null}>
        <ShellBanners />
      </Suspense>
      {children}
    </AppFrame>
  );
}

async function CustomerNav() {
  const { counts } = await getCustomerShell();
  return <SidebarNav nav="customer" tone="light" label="Lienket Studio" counts={counts} />;
}

async function WorkspaceCard() {
  const { workspace } = await getCustomerShell();
  return (
    <Link href="/app/settings/billing" className="flex items-center gap-2.5 border-t border-line px-1.5 pt-3 pb-2 no-underline">
      <span className="inline-flex size-[34px] flex-none items-center justify-center rounded-sm bg-[#3f3f46] text-xs font-semibold text-white">
        {initials(workspace.name)}
      </span>
      <div className="min-w-0">
        <b className="block truncate text-[13.5px] text-ink">{workspace.name}</b>
        <span className="text-xs text-muted">Gói {workspace.plan}</span>
      </div>
    </Link>
  );
}

async function TopbarActions() {
  const { user, workspace, notifications } = await getCustomerShell();
  return (
    <div className="flex items-center gap-3">
      <NotificationBell notifications={notifications} />
      <UserMenu
        name={user.name}
        email={user.email}
        role={`Gói ${workspace.plan}`}
        links={[
          { href: "/app/settings/billing", label: "Gói và thanh toán" },
          { href: "/app/settings/users", label: "Thành viên" },
        ]}
      />
    </div>
  );
}

async function ShellBanners() {
  const { impersonatedBy, user, broadcast } = await getCustomerShell();
  return (
    <>
      {impersonatedBy && (
        <Banner
          tone="impersonate"
          action={
            <form action={exitImpersonationAction}>
              <Button type="submit" size="sm">
                Thoát về khu quản trị
              </Button>
            </form>
          }
        >
          <b>Bạn đang xem với tư cách {user.name}.</b> Mọi thao tác được ghi vào nhật ký quản trị.
        </Banner>
      )}
      {broadcast && (
        <Banner tone="info">
          <b>Thông báo từ Lienket Studio:</b> {broadcast}
        </Banner>
      )}
    </>
  );
}
