# Lienket Studio – Frontend

SaaS săn deal affiliate: quét giá Shopee + TikTok Shop, lọc giảm giá ảo, duyệt deal, đăng Facebook/TikTok, trang so sánh giá công khai.
Next.js 16 (App Router, Cache Components, Partial Prefetching), TypeScript, Tailwind v4. Thiết kế gốc: [`design/mockup.html`](design/mockup.html).

## Chạy dự án

```bash
cp .env.example .env.local   # sửa NEXT_PUBLIC_SITE_URL; production bắt buộc SESSION_SECRET
npm install
npm run dev                  # http://localhost:3000
npm run build && npm start   # production
```

Tài khoản dùng thử (dữ liệu mẫu, mật khẩu `demo1234`): khách hàng `minhanh@example.com`, quản trị `admin@lienket.vn` (mã 2 lớp: 6 số bất kỳ).

## Kiến trúc

```
src/
  app/                     Định tuyến – mỏng, chỉ ghép feature lại
    (public)/              Trang công khai: SEO, prerender tĩnh, CDN cache (ensureStatic = "navigation")
    (auth)/login/          Đăng nhập + xác minh 2 lớp
    (app)/app/       Khu khách hàng: dynamic, noindex, dữ liệu theo phiên
    (app)/admin/           Khu quản trị nền tảng
  domain/                  Kiểu dữ liệu + logic nghiệp vụ thuần (không phụ thuộc framework)
  features/<tên>/          Theo nghiệp vụ: components/, server/ (queries, service), actions.ts
    auth · app-shell · dashboard · deals · publishing · public-catalog
  server/
    repositories/types.ts  Interface truy cập dữ liệu (Repository pattern)
    repositories/memory.ts Bản in-memory dùng dữ liệu mẫu
    container.ts           Composition root – chọn implementation theo DATA_SOURCE
    auth/                  token (JWT) · session (cookie) · dal (kiểm quyền)
  shared/                  UI kit theo design token, tiện ích, config
  proxy.ts                 Route guard: verify phiên, phân quyền, 404 tham số sai
```

**Luồng dữ liệu**

- **Đọc:** `page` → `features/*/server/queries` (gọi `requireCustomer()` / `requireAdmin()`) → `repositories()`.
- **Ghi:** Client Component → server action (`features/*/actions.ts`): validate bằng zod → kiểm lại quyền → service → `refresh()` / `revalidateTag()` → trả `ActionResult`.

**Quy tắc**

- `domain/` không import gì từ Next/React. Logic nghiệp vụ đặt ở đây hoặc trong service, không đặt trong component.
- Feature không import chéo `components` của nhau. Thứ dùng chung đưa lên `shared/` hoặc `domain/`.
- Mọi thao tác ghi đều đi qua server action và luôn gọi `requireCustomer()` / `requireAdmin()`. `proxy.ts` chỉ là lớp chặn sớm, không thay thế bước kiểm quyền này.
- Lỗi nghiệp vụ ném `DomainError`, bọc bằng `handleAction()` để trả về thông báo cho người dùng thay vì lỗi 500.
- Khi có backend thật: viết `server/repositories/api.ts` implement các interface trong `types.ts`, rồi thêm `case "api"` vào `container.ts`. UI và service không phải sửa.

**Trạng thái màn hình so với mockup**

| Đã làm | Chưa làm (đang là trang tạm) |
| --- | --- |
| Trang so sánh giá (`/`, `/deal/[slug]`) · Đăng nhập + 2FA · Tổng quan · Duyệt deal · Lịch đăng (3 kênh) · Khung admin | Ghép sản phẩm · Thống kê · Liên kết · Tài khoản liên kết · Kết nối và nguồn · Cài đặt · Các màn admin |

## SEO

- **Chỉ khu `(public)` được index.** Dashboard, admin và login đều đặt `noindex` và bị chặn trong `robots.txt`.
- **Metadata:** canonical, Open Graph, Twitter cho từng trang (`buildMetadata`); ảnh OG sinh riêng cho từng deal.
- **JSON-LD:** Organization, WebSite, Product + AggregateOffer (giá theo từng sàn), BreadcrumbList.
- **Link affiliate** gắn `rel="sponsored nofollow"` theo hướng dẫn của Google.
- **Biểu đồ lịch sử giá** là SVG render trên server, nên bot đọc được mà không cần JS.
- **Deal mới duyệt** (không có trong lần build) được render tĩnh ngay ở lần truy cập đầu rồi lưu cache (ISR với Cache Components).

## Chiến lược cache

| Tầng | Cái gì | Thời gian |
| --- | --- | --- |
| Trình duyệt | `/_next/static/*` (có hash) | 1 năm, `immutable` |
| CDN | HTML trang công khai (`s-maxage` + `stale-while-revalidate`) | profile `content`: 1h, giữ bản cũ 7 ngày |
| CDN | File `/public` | trình duyệt 1 ngày, CDN 31 ngày |
| Next.js server | Dữ liệu công khai `"use cache"` (tag `public-deals`) | theo `cacheLife`, xoá theo tag |
| Không cache | Dashboard / admin (`Cache-Control: private`) | dữ liệu theo phiên |

Khi duyệt deal, action gọi `revalidateTag("public-deals", "max")` và purge CDN cho `/` và `/deal`. Backend/CMS cũng có thể gọi webhook:

```bash
curl -X POST https://lienketstudio.com/api/revalidate \
  -H "x-revalidate-secret: $REVALIDATE_SECRET" -H "content-type: application/json" \
  -d '{"tags":["public-deals"],"paths":["/","/deal/slug-san-pham"]}'
```

## Cấu hình CDN

**Cách 1 – Cloudflare proxy toàn domain (khuyến nghị)**

1. Trỏ DNS qua Cloudflare, bật proxy.
2. Tạo *Cache Rule*: hostname = domain, loại trừ `/api/*`, `/app*`, `/admin*`, `/login` → **Eligible for cache**, Edge TTL: *Use cache-control header*.
3. **Không** bật "Ignore query string": `?_rsc=` phải nằm trong cache key, nếu không CDN sẽ trộn HTML với RSC payload.
4. Điền `CLOUDFLARE_ZONE_ID`, `CLOUDFLARE_API_TOKEN` (quyền *Zone.Cache Purge*).

**Cách 2 – Domain CDN riêng cho assets:** build với `NEXT_PUBLIC_CDN_URL=https://cdn.lienketstudio.com`; file `/public` dùng `cdn("/images/x.jpg")`.

Chạy nhiều instance: đặt cùng `deploymentId`, `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`, `SESSION_SECRET` và dùng cache handler chung (Redis). Xem `node_modules/next/dist/docs/01-app/02-guides/self-hosting.md`.

## Deploy

```bash
docker build --build-arg NEXT_PUBLIC_SITE_URL=https://lienketstudio.com -t lienketstudio-fe .
docker run -p 3000:3000 -e SESSION_SECRET=... -e REVALIDATE_SECRET=... lienketstudio-fe
```

Đặt `deploy/nginx.conf` phía trước (VPS) để có thêm tầng cache ở origin.

## Lưu ý

- `NEXT_PUBLIC_*` được nhúng lúc build, nên đổi domain phải build lại.
- Không dùng `cookies()`/`headers()` trong `(public)`: build sẽ fail (có `ensureStatic`), vì trang dynamic thì CDN không cache được.
- Dữ liệu in-memory reset khi khởi động lại server. Đây là bản mock, chỉ dùng cho dev/demo.
