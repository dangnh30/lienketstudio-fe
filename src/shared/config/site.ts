export const siteConfig = {
  name: "Lienket Studio",
  shortName: "Lienket",
  description:
    "So sánh giá Shopee và TikTok Shop, lịch sử giá 90 ngày, chỉ đăng deal giảm giá thật – không giảm giá ảo.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
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
