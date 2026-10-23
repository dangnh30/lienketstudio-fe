import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

/**
 * CDN cho static assets (JS/CSS/font trong /_next/static).
 * Để trống => assets phục vụ cùng domain (phù hợp khi đặt Cloudflare/CDN proxy trước cả site).
 * Đặt NEXT_PUBLIC_CDN_URL=https://cdn.lienketstudio.com => dùng CDN pull-zone riêng cho assets.
 */
const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL?.replace(/\/$/, "") || undefined;

const ONE_YEAR = 60 * 60 * 24 * 365;
const ONE_MONTH = 60 * 60 * 24 * 31;

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

export default function config(phase: string): NextConfig {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;

  return {
    // Build gọn để chạy Docker / VPS (chỉ copy .next/standalone + static + public)
    output: "standalone",
    poweredByHeader: false,
    compress: true, // gzip ở Node; nếu nginx/CDN đã nén (brotli) có thể tắt để đỡ CPU
    reactStrictMode: true,

    assetPrefix: isDev ? undefined : CDN_URL,

    // Cache Components: HTML được prerender sẵn, CDN cache theo s-maxage / stale-while-revalidate
    cacheComponents: true,
    partialPrefetching: true,

    turbopack: {
      rules: {
        "*.css": {
          loaders: ["@tailwindcss/turbopack"],
          as: "*.css",
        },
      },
    },

    // Các profile cache dùng với cacheLife("...")
    cacheLife: {
      // Nội dung bài viết: CDN/server giữ 1 giờ, phục vụ bản cũ tối đa 7 ngày trong lúc làm mới nền
      content: {
        stale: 300,
        revalidate: 3600,
        expire: 60 * 60 * 24 * 7,
      },
      // Trang gần như tĩnh (giới thiệu, chính sách...)
      static: {
        stale: 3600,
        revalidate: 60 * 60 * 24,
        expire: ONE_YEAR,
      },
    },

    images: {
      formats: ["image/avif", "image/webp"],
      qualities: [60, 75, 90],
      // Ảnh đã tối ưu được cache 31 ngày => giảm CPU resize ảnh
      minimumCacheTTL: ONE_MONTH,
      deviceSizes: [640, 750, 828, 1080, 1200, 1920],
      imageSizes: [32, 64, 128, 256, 384],
      remotePatterns: [
        // Thêm domain ảnh từ CMS / storage tại đây
        // { protocol: "https", hostname: "cdn.lienketstudio.com" },
      ],
    },

    async headers() {
      return [
        {
          source: "/:path*",
          headers: securityHeaders,
        },
        // File trong /public không có hash => cache dài ở CDN, ngắn hơn ở trình duyệt
        {
          source: "/:file(.+\\.(?:ico|png|jpg|jpeg|gif|webp|avif|svg|woff2?|ttf|otf|mp4|webm))",
          headers: [
            {
              key: "Cache-Control",
              value: `public, max-age=86400, s-maxage=${ONE_MONTH}, stale-while-revalidate=${ONE_YEAR}`,
            },
          ],
        },
        {
          source: "/:file(sitemap.xml|robots.txt|manifest.webmanifest)",
          headers: [
            { key: "Cache-Control", value: "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400" },
          ],
        },
        // Thư mục /static trong public: chỉ đặt file có version trong tên => immutable
        {
          source: "/static/:path*",
          headers: [{ key: "Cache-Control", value: `public, max-age=${ONE_YEAR}, immutable` }],
        },
        // CORS cho font khi assets nằm trên domain CDN riêng
        ...(CDN_URL
          ? [
              {
                source: "/_next/static/:path*",
                headers: [{ key: "Access-Control-Allow-Origin", value: "*" }],
              },
            ]
          : []),
      ];
    },
  };
}
