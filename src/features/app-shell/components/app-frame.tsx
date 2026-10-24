import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

/*
 * Khung bố cục dùng chung cho khu khách hàng và khu quản trị (Template pattern):
 * vị trí sidebar / topbar / nội dung cố định, từng khu tự truyền nội dung vào các slot.
 */

type AppFrameProps = {
  tone: "light" | "dark";
  logo: ReactNode;
  nav: ReactNode;
  sidebarFooter?: ReactNode;
  topbar: ReactNode;
  children: ReactNode;
};

export function AppFrame({ tone, logo, nav, sidebarFooter, topbar, children }: AppFrameProps) {
  return (
    <div className="flex min-h-screen bg-white max-[900px]:flex-col">
      <aside
        className={cn(
          "sticky top-0 flex h-screen w-[244px] flex-none flex-col gap-[18px] overflow-y-auto px-3 pt-4 pb-3",
          "max-[900px]:static max-[900px]:h-auto max-[900px]:w-auto max-[900px]:gap-2.5 max-[900px]:p-3",
          tone === "dark" ? "bg-[#1c1c1f]" : "border-r border-line bg-panel max-[900px]:border-r-0 max-[900px]:border-b",
        )}
      >
        {logo}
        {nav}
        {sidebarFooter && <div className="mt-auto flex flex-col gap-2.5 max-[900px]:hidden">{sidebarFooter}</div>}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-white/88 px-8 py-2.5 backdrop-blur-md backdrop-saturate-[1.8] max-[900px]:static max-[900px]:px-4">
          {topbar}
        </header>
        <main className="flex w-full max-w-[1320px] flex-1 flex-col gap-[22px] px-8 pt-7 pb-16 max-[900px]:px-4 max-[900px]:pt-5 max-[900px]:pb-12">
          {children}
        </main>
      </div>
    </div>
  );
}
