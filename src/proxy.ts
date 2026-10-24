import { NextResponse, type NextRequest } from "next/server";
import { CHANNELS } from "@/domain/platform";
import type { SessionPayload } from "@/domain/user";
import { ROLE_HINT_COOKIE, SESSION_COOKIE, verifyToken } from "@/server/auth/token";
import { PERFORMANCE_TABS } from "@/features/analytics/range";
import { SETTINGS_TABS } from "@/features/settings/tabs";

/*
 * Route guard chạy trước khi render, nên trả được đúng status (307/404) ngay cả khi
 * trang dùng streaming. Đây là lớp chặn sớm; quyền thật vẫn kiểm lại ở server/auth/dal.ts
 * (trong page và server action) – không dựa vào proxy làm lớp bảo vệ duy nhất.
 * Chỉ chạy trên route riêng tư => trang công khai không qua proxy, CDN cache bình thường.
 */

/** Route có tham số thuộc tập giá trị cố định: sai thì 404 ngay (dynamicParams không dùng được với Cache Components) */
const ENUM_ROUTES: [RegExp, readonly string[]][] = [
  [/^\/app\/schedule\/([^/]+)\/?$/, CHANNELS],
  [/^\/app\/performance\/([^/]+)\/?$/, Object.keys(PERFORMANCE_TABS)],
  [/^\/app\/settings\/([^/]+)\/?$/, Object.keys(SETTINGS_TABS)],
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await verifyToken<SessionPayload>(request.cookies.get(SESSION_COOKIE)?.value);

  if (!session) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    const res = NextResponse.redirect(url);
    // Token hết hạn / sai chữ ký: xóa cả cookie phiên lẫn cookie gợi ý vai trò
    if (request.cookies.has(SESSION_COOKIE)) {
      res.cookies.delete(SESSION_COOKIE);
      res.cookies.delete(ROLE_HINT_COOKIE);
    }
    return res;
  }

  const isAdminArea = pathname === "/admin" || pathname.startsWith("/admin/");
  if (isAdminArea && session.role !== "admin") {
    return NextResponse.redirect(new URL("/app", request.url));
  }
  if (!isAdminArea && session.role === "admin" && !session.impersonating) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  for (const [pattern, allowed] of ENUM_ROUTES) {
    const match = pathname.match(pattern);
    if (match && !allowed.includes(match[1])) {
      return NextResponse.rewrite(new URL("/404", request.url), { status: 404 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/admin/:path*"],
};
