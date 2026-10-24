import { z } from "zod";

/* Schema cho từng form cài đặt. Dữ liệu đến từ FormData nên số/checkbox cần chuyển kiểu. */

const int = (min: number, max: number) =>
  z.coerce
    .number({ error: `Nhập số nguyên từ ${min} đến ${max}` })
    .int(`Nhập số nguyên từ ${min} đến ${max}`)
    .min(min, `Nhập số nguyên từ ${min} đến ${max}`)
    .max(max, `Nhập số nguyên từ ${min} đến ${max}`);

/** Checkbox HTML gửi "on" khi được tích, không gửi gì khi bỏ tích */
const checkbox = z.preprocess((v) => v === "on" || v === "true", z.boolean());

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Chọn giờ");

export const generalSchema = z.object({
  name: z.string().trim().min(1, "Không được để trống").max(80, "Tối đa 80 ký tự"),
  quietFrom: time,
  quietTo: time,
  /** Tên các ngách đang bật (checkbox name="niche" value="<tên>") */
  niche: z.array(z.string()).default([]),
});

export const nicheSchema = z.object({
  name: z.string().trim().min(1, "Nhập tên ngách").max(60, "Tối đa 60 ký tự"),
});

export const filterSchema = z.object({
  minDrop: int(1, 90),
  minScore: int(0, 100),
  fakeRise: int(1, 200),
  minCommission: int(0, 50),
  capFbPagePerDay: int(1, 50),
  capFbGroupPerDay: int(0, 30),
  disclosure: z.string().trim().min(1, "Câu ghi chú là bắt buộc").max(300, "Tối đa 300 ký tự"),
  verifyBeforePost: checkbox,
  manualReview: checkbox,
  aiNoClaims: checkbox,
});

export const scanSchema = z.object({
  hotMinutes: int(1, 60),
  tiktokMinutes: int(5, 180),
  normalMinutes: int(30, 1440),
  feedAt: time,
  accessTradeRatePerMinute: int(1, 30),
  retries: int(0, 5),
  verifyMinutesBeforePost: int(1, 30),
});

export const notifySchema = z.object({
  push: checkbox,
  email: checkbox,
  newDeal: checkbox,
  readyToPost: checkbox,
  fakeDeal: checkbox,
  apiError: checkbox,
  tokenExpiry: checkbox,
  dailyDigest: checkbox,
  digestAt: time,
});

export const inviteSchema = z.object({
  name: z.string().trim().min(1, "Nhập tên").max(80),
  email: z.email("Email chưa đúng định dạng").trim().toLowerCase(),
  role: z.enum(["editor", "viewer"]),
});

export const systemSchema = z.object({ paused: checkbox });

export const changePlanSchema = z.object({ planId: z.enum(["free", "basic", "pro", "team"]) });
