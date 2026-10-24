import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Email chưa đúng định dạng").trim(),
  password: z.string().min(8, "Mật khẩu có ít nhất 8 ký tự"),
  next: z.string().optional(),
});

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Nhập họ và tên").max(80),
  email: z.email("Email chưa đúng định dạng").trim().toLowerCase(),
  password: z.string().min(8, "Mật khẩu có ít nhất 8 ký tự").max(128),
  workspaceName: z.string().trim().min(1, "Đặt tên cho kênh hoặc workspace").max(80),
  terms: z.literal("on", { error: "Cần đồng ý điều khoản để tạo tài khoản" }),
});

export const twoFactorSchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/, "Mã gồm đúng 6 chữ số"),
});

/** Chỉ cho phép chuyển hướng nội bộ để tránh open redirect */
export function safeNextPath(next: string | undefined, fallback: string) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}
