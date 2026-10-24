import { siteConfig } from "@/shared/config/site";
import { Logo } from "@/shared/ui/logo";
import { PublicAccountActions } from "./account-actions";

export function SiteBar() {
  return (
    <header className="border-b border-line bg-white shadow-[0_1px_2px_rgb(16_18_24/0.04)]">
      <div className="mx-auto flex max-w-[1080px] flex-wrap items-center gap-4 px-5 py-3">
        <Logo href="/" subtitle="So sánh giá" />
        <span className="flex-1" />
        <PublicAccountActions />
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-[1080px] px-5 pb-10 text-[13px] text-muted">
      © {siteConfig.name}. Giá cập nhật tự động từ Shopee, TikTok Shop và các website bán lẻ, có thể thay đổi tại thời điểm mua.
    </footer>
  );
}
