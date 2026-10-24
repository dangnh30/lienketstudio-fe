import type { Metadata } from "next";
import { AccentInit } from "@/shared/ui/theme";
import { ToastProvider } from "@/shared/ui/toast";
import { CustomerShell } from "@/features/app-shell/components/customer-shell";

// Khu ứng dụng sau đăng nhập: không index, không cache CDN (dữ liệu theo phiên)
export const metadata: Metadata = {
  title: { default: "Tổng quan", template: "%s · Lienket Studio" },
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: LayoutProps<"/app">) {
  return (
    <ToastProvider>
      <AccentInit />
      <CustomerShell>{children}</CustomerShell>
    </ToastProvider>
  );
}
