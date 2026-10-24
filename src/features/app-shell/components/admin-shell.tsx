import { Shield } from "lucide-react";
import { Suspense, type ReactNode } from "react";
import { Logo } from "@/shared/ui/logo";
import { requireAdmin } from "@/server/auth/dal";
import { getAdminCounts } from "@/features/admin/server/queries";
import { AppFrame } from "./app-frame";
import { Crumb, SidebarNav } from "./sidebar-nav";
import { CustomerSearchBox } from "./search-box";
import { UserMenu } from "./user-menu";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <AppFrame
      tone="dark"
      logo={<Logo href="/admin" subtitle="Quản trị nền tảng" tone="dark" icon={<Shield className="size-[17px]" aria-hidden="true" />} />}
      nav={
        <Suspense fallback={<SidebarNav nav="admin" tone="dark" label="Quản trị" />}>
          <AdminNav />
        </Suspense>
      }
      topbar={
        <>
          <Crumb nav="admin" root="Quản trị" />
          <CustomerSearchBox />
          <Suspense fallback={<div className="size-8" />}>
            <AdminMenu />
          </Suspense>
        </>
      }
    >
      {children}
    </AppFrame>
  );
}

async function AdminNav() {
  const counts = await getAdminCounts();
  return <SidebarNav nav="admin" tone="dark" label="Quản trị" counts={counts} />;
}

async function AdminMenu() {
  const admin = await requireAdmin();
  return (
    <UserMenu
      name={admin.name}
      email={admin.email}
      role="Quản trị viên nền tảng"
      links={[{ href: "/admin/settings", label: "Cài đặt nền tảng" }]}
    />
  );
}
