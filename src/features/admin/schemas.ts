import { z } from "zod";

const int = (min: number, max: number) =>
  z.coerce
    .number({ error: `Số nguyên từ ${min.toLocaleString("vi-VN")} đến ${max.toLocaleString("vi-VN")}` })
    .int(`Số nguyên từ ${min.toLocaleString("vi-VN")} đến ${max.toLocaleString("vi-VN")}`)
    .min(min, `Số nguyên từ ${min.toLocaleString("vi-VN")} đến ${max.toLocaleString("vi-VN")}`)
    .max(max, `Số nguyên từ ${min.toLocaleString("vi-VN")} đến ${max.toLocaleString("vi-VN")}`);

const checkbox = z.preprocess((v) => v === "on" || v === "true", z.boolean());
/** Cho phép nhập "149.000" */
const money = z.preprocess((v) => (typeof v === "string" ? v.replace(/\./g, "").trim() : v), int(0, 10_000_000));

export const planId = z.enum(["free", "basic", "pro", "team"]);

export const editPlanSchema = z.object({
  planId,
  price: money,
  products: int(1, 1_000_000),
  fbPostsPerDay: int(1, 500),
  pages: int(0, 100),
  links: int(0, 1_000_000),
  members: int(1, 100),
  visible: checkbox,
});

export const platformSchema = z.object({
  signupEnabled: checkbox,
  requireEmailVerification: checkbox,
  trialDays: int(0, 60),
  broadcastEnabled: checkbox,
  broadcast: z.string().trim().max(300, "Tối đa 300 ký tự"),
  maintenance: checkbox,
  requireAdmin2fa: checkbox,
  adminSessionHours: int(1, 72),
});

export const replySchema = z.object({
  ticketId: z.string().min(1).max(64),
  text: z.string().trim().min(1, "Viết nội dung trả lời").max(2000),
});

export const lockSchema = z.object({
  customerId: z.string().min(1).max(64),
  reason: z.string().trim().min(3, "Ghi lý do khóa").max(200),
});
