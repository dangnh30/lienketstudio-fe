# Liên Kết Studio – Frontend

Next.js 16 (App Router, Cache Components, TypeScript, Tailwind v4), tối ưu SEO và cache CDN.

## Chạy dự án

```bash
cp .env.example .env.local   # sửa NEXT_PUBLIC_SITE_URL
npm install
npm run dev                  # http://localhost:3000
npm run build && npm start   # production
```

## Cấu trúc

```
src/
  app/
    layout.tsx               # Metadata gốc, font tiếng Việt, JSON-LD Organization + WebSite
    page.tsx                 # Trang chủ
    blog/[slug]/             # Bài viết: generateStaticParams, generateMetadata, JSON-LD, OG image động
    gioi-thieu/              # Trang tĩnh
    sitemap.ts robots.ts manifest.ts opengraph-image.tsx icon.svg
    api/revalidate/route.ts  # Webhook làm mới cache + purge CDN
  config/site.ts             # Tên site, domain, menu, social
  lib/seo.ts                 # buildMetadata(): canonical, OG, Twitter
  lib/data/posts.ts          # Data layer có "use cache" + cacheTag
  lib/cdn.ts                 # cdn(): gắn domain CDN cho file /public
  lib/cdn-purge.ts           # Purge Cloudflare
deploy/nginx.conf            # Reverse proxy + cache tầng origin
Dockerfile                   # Build standalone
```

## SEO có sẵn

- `metadataBase`, title template `%s | Liên Kết Studio`, canonical cho từng trang
- Open Graph + Twitter card, ảnh OG sinh tự động (`opengraph-image.tsx`)
- `sitemap.xml`, `robots.txt` (staging: `NEXT_PUBLIC_NOINDEX=true`), `manifest.webmanifest`
- JSON-LD: Organization, WebSite, BlogPosting, BreadcrumbList
- `lang="vi"`, font Be Vietnam Pro tự host (subset vietnamese, `display: swap`)
- Trang được **prerender thành HTML tĩnh** → TTFB thấp, bot đọc được đầy đủ nội dung

Thêm trang mới: export `metadata = buildMetadata({ title, description, path })` và thêm URL vào `sitemap.ts`.

## Chiến lược cache (3 tầng)

| Tầng | Cái gì | Thời gian |
| --- | --- | --- |
| Trình duyệt | `/_next/static/*` (có hash) | 1 năm, `immutable` |
| CDN | HTML trang (`s-maxage` + `stale-while-revalidate`) | theo `cacheLife` (`content`: 1h, giữ bản cũ 7 ngày) |
| CDN | File `/public` (ảnh, font, icon) | trình duyệt 1 ngày, CDN 31 ngày |
| Next.js server | Dữ liệu `"use cache"` | theo `cacheLife`, xoá bằng `cacheTag` |
| Next.js server | Ảnh `next/image` đã tối ưu (avif/webp) | 31 ngày |

Profile cache khai báo trong `next.config.ts` → `cacheLife`. Dùng trong data function:

```ts
export async function getProducts() {
  "use cache";
  cacheLife("content");
  cacheTag("products");
  return fetch(`${process.env.API_URL}/products`).then((r) => r.json());
}
```

### Khi nội dung thay đổi

CMS/backend gọi webhook:

```bash
curl -X POST https://lienketstudio.com/api/revalidate \
  -H "x-revalidate-secret: $REVALIDATE_SECRET" \
  -H "content-type: application/json" \
  -d '{"tags":["posts"],"paths":["/blog","/blog/slug-bai-viet"]}'
```

→ đánh dấu cache Next.js là cũ (người dùng vẫn nhận bản cũ ngay, bản mới render nền) và purge CDN các đường dẫn đó.

## Cấu hình CDN

**Cách 1 – Cloudflare proxy toàn domain (khuyến nghị, đơn giản nhất)**

1. Trỏ DNS qua Cloudflare, bật proxy (mây cam).
2. Tạo *Cache Rule*: hostname = domain, không phải `/api/*` → **Eligible for cache**, Edge TTL: *Use cache-control header*, Browser TTL: *Respect origin*.
3. **Không** bật "Ignore query string" – `?_rsc=` phải nằm trong cache key, nếu không sẽ trộn HTML với RSC payload làm hỏng điều hướng.
4. Điền `CLOUDFLARE_ZONE_ID`, `CLOUDFLARE_API_TOKEN` (quyền *Zone.Cache Purge*) để webhook tự purge.

**Cách 2 – Domain CDN riêng cho assets (BunnyCDN, CloudFront, ...)**

1. Tạo pull zone `cdn.lienketstudio.com` với origin = domain chính.
2. Build với `NEXT_PUBLIC_CDN_URL=https://cdn.lienketstudio.com` → JS/CSS tự lấy từ CDN.
3. File trong `/public` dùng `cdn("/images/x.jpg")` để trỏ qua CDN.

Có thể kết hợp cả hai. Nếu chạy nhiều instance, đặt cùng `deploymentId` và `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`, và dùng cache handler chung (Redis) – xem `node_modules/next/dist/docs/01-app/02-guides/self-hosting.md`.

## Deploy

```bash
docker build --build-arg NEXT_PUBLIC_SITE_URL=https://lienketstudio.com -t lienketstudio-fe .
docker run -p 3000:3000 -e REVALIDATE_SECRET=... lienketstudio-fe
```

Đặt `deploy/nginx.conf` phía trước (VPS) để có thêm tầng cache ở origin.

## Lưu ý

- `NEXT_PUBLIC_*` được nhúng lúc build → đổi domain phải build lại.
- Không dùng `cookies()`/`headers()` trong trang cần SEO trừ khi bắt buộc – trang sẽ thành dynamic (`Cache-Control: private`) và CDN không cache được.
- Ảnh: dùng `next/image` với `sizes` hợp lý; ảnh từ domain ngoài phải khai báo trong `images.remotePatterns`.
