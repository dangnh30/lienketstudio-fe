import { cacheLife } from "next/cache";
import { siteConfig } from "@/config/site";

export async function SiteFooter() {
  "use cache";
  cacheLife("static");
  // Năm được tính lúc prerender rồi cache lại (không làm trang thành dynamic)
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-black/10 dark:border-white/10">
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-black/60 dark:text-white/60">
        © {year} {siteConfig.name}. Bảo lưu mọi quyền.
      </div>
    </footer>
  );
}
