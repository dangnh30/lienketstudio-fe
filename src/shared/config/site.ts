/**
 * Domain chính: ưu tiên NEXT_PUBLIC_SITE_URL (domain riêng); nếu không đặt mà đang build trên Vercel
 * thì dùng domain production do Vercel cấp sẵn; cuối cùng là localhost khi chạy trên máy.
 */
function resolveSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  const vercel = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const url = explicit || (vercel ? `https://${vercel}` : "http://localhost:3000");
  return url.replace(/\/$/, "");
}

export const siteConfig = {
  name: "Lienket Studio",
  shortName: "Lienket",
  description:
    "So sánh giá Shopee và TikTok Shop, lịch sử giá 90 ngày, chỉ đăng deal giảm giá thật – không giảm giá ảo.",
  url: resolveSiteUrl(),
  locale: "vi_VN",
  language: "vi",
  twitter: "@lienketstudio",
  keywords: ["so sánh giá", "Shopee", "TikTok Shop", "lịch sử giá", "deal thật", "săn sale"],
  /** Câu công bố tiếp thị liên kết hiển thị trên trang công khai */
  affiliateDisclosure:
    "Trang có chứa link tiếp thị liên kết. Chúng tôi nhận hoa hồng nếu bạn mua qua link, giá bạn trả không đổi.",
  contact: {
    email: "contact@lienketstudio.com",
  },
  social: [
    // { href: "https://www.facebook.com/lienketstudio", label: "Facebook" },
    // { href: "https://www.tiktok.com/@lienketstudio", label: "TikTok" },
  ] as { href: string; label: string }[],
} as const;

export type SiteConfig = typeof siteConfig;
