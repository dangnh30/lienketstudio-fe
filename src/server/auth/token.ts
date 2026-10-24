import { jwtVerify, SignJWT, type JWTPayload } from "jose";

/*
 * Ký / xác minh token phiên (HS256). Không phụ thuộc next/headers nên dùng được
 * cả trong server code (session.ts) lẫn proxy.ts.
 */

export const SESSION_COOKIE = "lk_session";
export const PENDING_2FA_COOKIE = "lk_2fa";
/** Gợi ý vai trò cho giao diện công khai (không bảo mật, không dùng để phân quyền) */
export const ROLE_HINT_COOKIE = "lk_role";

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") throw new Error("Thiếu SESSION_SECRET");
    return new TextEncoder().encode("dev-only-insecure-session-secret-change-me");
  }
  return new TextEncoder().encode(secret);
}

export async function signToken(payload: JWTPayload, expiresIn: string) {
  return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(expiresIn).sign(secretKey());
}

export async function verifyToken<T>(token: string | undefined): Promise<T | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    return payload as T;
  } catch {
    return null;
  }
}
