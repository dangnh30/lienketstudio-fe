export const siteConfig = {
  name: "Liên Kết Studio",
  shortName: "LKS",
  description:
    "Liên Kết Studio – giải pháp thiết kế, sản xuất nội dung và phát triển thương hiệu.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  locale: "vi_VN",
  language: "vi",
  twitter: "@lienketstudio",
  keywords: ["Liên Kết Studio", "thiết kế", "studio", "branding", "sản xuất nội dung"],
  contact: {
    email: "contact@lienketstudio.com",
    phone: "",
  },
  social: [
    // "https://www.facebook.com/lienketstudio",
  ] as string[],
  nav: [
    { href: "/", label: "Trang chủ" },
    { href: "/blog", label: "Blog" },
    { href: "/gioi-thieu", label: "Giới thiệu" },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
