import "server-only";
import { cookies } from "next/headers";
import type { SessionPayload } from "@/domain/user";
import { PENDING_2FA_COOKIE, ROLE_HINT_COOKIE, SESSION_COOKIE, signToken, verifyToken } from "./token";

const SESSION_HOURS = 8;
const PENDING_2FA_MINUTES = 5;

const cookieOptions = (maxAgeSeconds: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: maxAgeSeconds,
});

/** hours: thời hạn phiên (mặc định 8 giờ; phiên admin lấy theo cài đặt nền tảng) */
export async function createSession(payload: SessionPayload, hours = SESSION_HOURS) {
  const token = await signToken({ ...payload }, `${hours}h`);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, cookieOptions(hours * 3600));
  // Cookie phụ, JS đọc được: chỉ cho trang công khai (tĩnh) biết hiện nút nào ở thanh đầu trang.
  // Không dùng để phân quyền – quyền luôn kiểm bằng cookie phiên đã ký ở server.
  store.set(ROLE_HINT_COOKIE, payload.role === "admin" && !payload.impersonating ? "admin" : "customer", {
    ...cookieOptions(hours * 3600),
    httpOnly: false,
  });
}

export async function readSession(): Promise<SessionPayload | null> {
  return verifyToken<SessionPayload>((await cookies()).get(SESSION_COOKIE)?.value);
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(PENDING_2FA_COOKIE);
  store.delete(ROLE_HINT_COOKIE);
}

/** Bước trung gian: đã đúng mật khẩu, chờ mã 2 lớp */
export async function createPending2fa(userId: string) {
  const token = await signToken({ userId }, `${PENDING_2FA_MINUTES}m`);
  (await cookies()).set(PENDING_2FA_COOKIE, token, cookieOptions(PENDING_2FA_MINUTES * 60));
}

export async function readPending2fa(): Promise<{ userId: string } | null> {
  return verifyToken<{ userId: string }>((await cookies()).get(PENDING_2FA_COOKIE)?.value);
}

export async function clearPending2fa() {
  (await cookies()).delete(PENDING_2FA_COOKIE);
}
