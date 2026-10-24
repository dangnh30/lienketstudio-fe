import type { Metadata } from "next";
import { AccentInit } from "@/shared/ui/theme";
import { ToastProvider } from "@/shared/ui/toast";
import { AdminShell } from "@/features/app-shell/components/admin-shell";

export const metadata: Metadata = {
  title: { default: "Quản trị", template: "%s · Quản trị Lienket" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <ToastProvider>
      <AccentInit />
      <AdminShell>{children}</AdminShell>
    </ToastProvider>
  );
}
