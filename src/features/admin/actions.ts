"use server";

import { refresh, revalidateTag } from "next/cache";
import { PLATFORM_SETTINGS_TAG } from "@/features/public-catalog/server/queries";
import { redirect } from "next/navigation";
import { z } from "zod";
import { fail, handleAction, ok, zodFieldErrors, type ActionResult } from "@/shared/lib/action-result";
import { requireAdmin } from "@/server/auth/dal";
import { createSession } from "@/server/auth/session";
import { formDataToObject } from "@/shared/lib/form-data";
import { editPlanSchema, lockSchema, planId, platformSchema, replySchema } from "./schemas";
import { adminService } from "./server/admin.service";

const id = z.string().min(1).max(64);

/** Mọi action quản trị: xác thực admin → service (tự ghi nhật ký) → refresh */
async function asAdmin<T>(fn: (svc: ReturnType<typeof adminService>) => Promise<ActionResult<T>>) {
  return handleAction(async () => {
    const admin = await requireAdmin();
    const result = await fn(adminService(admin));
    refresh();
    return result;
  });
}

export async function changeCustomerPlanAction(customerId: string, plan: string) {
  return asAdmin(async (svc) => ok(undefined, `Đã đổi sang gói ${await svc.changePlan(id.parse(customerId), planId.parse(plan))}`));
}

export async function extendTrialAction(customerId: string) {
  return asAdmin(async (svc) => ok(undefined, `Đã gia hạn dùng thử đến ${await svc.extendTrial(id.parse(customerId))}`));
}

export async function remindCustomerAction(customerId: string) {
  return asAdmin(async (svc) => {
    await svc.remindPayment(id.parse(customerId));
    return ok(undefined, "Đã gửi email nhắc thanh toán");
  });
}

export async function lockCustomerAction(customerId: string, reason: string) {
  return asAdmin(async (svc) => {
    const parsed = lockSchema.parse({ customerId, reason });
    return ok(undefined, `Đã khóa ${await svc.lock(parsed.customerId, parsed.reason)}, khách không đăng nhập được`);
  });
}

export async function unlockCustomerAction(customerId: string) {
  return asAdmin(async (svc) => ok(undefined, `Đã mở khóa ${await svc.unlock(id.parse(customerId))}`));
}

/** Đăng nhập thay khách: phiên vẫn là của admin, chỉ thêm trường impersonating */
export async function impersonateAction(customerId: string) {
  const admin = await requireAdmin();
  const result = await handleAction(async () => ok(await adminService(admin).impersonate(id.parse(customerId))));
  if (!result.ok) return result;
  await createSession({ userId: admin.id, role: "admin", impersonating: result.data });
  redirect("/app");
}

export async function savePlanAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = editPlanSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return fail("Kiểm tra lại các ô được đánh dấu", zodFieldErrors(parsed.error));
  const { planId: pid, ...patch } = parsed.data;
  return asAdmin(async (svc) => ok(undefined, `Đã lưu gói ${await svc.updatePlan(pid, patch)}`));
}

export async function markInvoicePaidAction(number: string) {
  return asAdmin(async (svc) => {
    await svc.markInvoicePaid(z.string().max(32).parse(number));
    return ok(undefined, `Đã ghi nhận thanh toán ${number}`);
  });
}

export async function remindInvoiceAction(number: string) {
  return asAdmin(async (svc) => ok(undefined, `Đã gửi nhắc cho ${await svc.remindInvoice(z.string().max(32).parse(number))}`));
}

export async function replyTicketAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = replySchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return fail("Viết nội dung trả lời", zodFieldErrors(parsed.error));
  return asAdmin(async (svc) => {
    await svc.replyTicket(parsed.data.ticketId, parsed.data.text);
    return ok(undefined, "Đã gửi trả lời");
  });
}

export async function setTicketStatusAction(ticketId: string, status: "open" | "closed") {
  return asAdmin(async (svc) => {
    await svc.setTicketStatus(id.parse(ticketId), z.enum(["open", "closed"]).parse(status));
    return ok(undefined, status === "closed" ? "Đã đánh dấu xong" : "Đã mở lại yêu cầu");
  });
}

export async function savePlatformAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = platformSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return fail("Kiểm tra lại các ô được đánh dấu", zodFieldErrors(parsed.error));
  return asAdmin(async (svc) => {
    await svc.updatePlatform(parsed.data);
    // Trang công khai hiển thị số ngày dùng thử
    revalidateTag(PLATFORM_SETTINGS_TAG, "max");
    return ok(undefined, "Đã lưu cài đặt nền tảng");
  });
}

export async function testPlatformKeyAction(name: string) {
  return asAdmin(async () => ok(undefined, `${z.string().max(40).parse(name)}: kết nối thành công`));
}
