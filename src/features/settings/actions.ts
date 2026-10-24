"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { fail, handleAction, ok, zodFieldErrors, type ActionResult } from "@/shared/lib/action-result";
import { requireCustomer } from "@/server/auth/dal";
import {
  changePlanSchema,
  filterSchema,
  generalSchema,
  inviteSchema,
  nicheSchema,
  notifySchema,
  scanSchema,
  systemSchema,
} from "./schemas";
import { formDataToObject } from "@/shared/lib/form-data";
import { settingsService } from "./server/settings.service";

/*
 * Form action chuẩn (dùng với useActionState): parse FormData bằng schema →
 * trả lỗi theo field nếu sai → gọi service → refresh.
 */
function formAction<S extends z.ZodType>(
  schema: S,
  run: (workspaceId: string, data: z.output<S>) => Promise<string | void>,
  options: { arrayKeys?: string[]; message?: string } = {},
) {
  return async (_prev: ActionResult | null, formData: FormData): Promise<ActionResult> => {
    const parsed = schema.safeParse(formDataToObject(formData, options.arrayKeys));
    if (!parsed.success) return fail("Kiểm tra lại các ô được đánh dấu", zodFieldErrors(parsed.error));
    return handleAction(async () => {
      const { workspaceId } = await requireCustomer();
      const message = await run(workspaceId, parsed.data);
      refresh();
      return ok(undefined, message || options.message || "Đã lưu cài đặt");
    });
  };
}

export const saveGeneralAction = async (prev: ActionResult | null, fd: FormData) =>
  formAction(generalSchema, (ws, d) => settingsService().updateGeneral(ws, d), { arrayKeys: ["niche"] })(prev, fd);

export const addNicheAction = async (prev: ActionResult | null, fd: FormData) =>
  formAction(nicheSchema, async (ws, d) => {
    await settingsService().addNiche(ws, d.name);
    return `Đã thêm ngách "${d.name}", đang tắt`;
  })(prev, fd);

export const saveFilterAction = async (prev: ActionResult | null, fd: FormData) =>
  formAction(filterSchema, (ws, d) => settingsService().updateFilter(ws, d))(prev, fd);

export const saveScanAction = async (prev: ActionResult | null, fd: FormData) =>
  formAction(scanSchema, (ws, d) => settingsService().updateScan(ws, d))(prev, fd);

export const saveNotifyAction = async (prev: ActionResult | null, fd: FormData) =>
  formAction(notifySchema, (ws, d) => settingsService().updateNotify(ws, d))(prev, fd);

export const inviteMemberAction = async (prev: ActionResult | null, fd: FormData) =>
  formAction(inviteSchema, async (ws, d) => {
    await settingsService().inviteMember(ws, d);
    return `Đã gửi lời mời tới ${d.email}`;
  })(prev, fd);

export const saveSystemAction = async (prev: ActionResult | null, fd: FormData) =>
  formAction(systemSchema, async (ws, d) => {
    await settingsService().setPaused(ws, d.paused);
    return d.paused ? "Đã lưu · đang tạm dừng đăng bài" : "Đã lưu · đăng bài hoạt động bình thường";
  })(prev, fd);

export async function removeMemberAction(memberId: string) {
  return handleAction(async () => {
    const { workspaceId } = await requireCustomer();
    const name = await settingsService().removeMember(workspaceId, z.string().max(64).parse(memberId));
    refresh();
    return ok(undefined, `Đã gỡ ${name}`);
  });
}

export async function requestDeletionAction(confirmName: string) {
  return handleAction(async () => {
    const { workspaceId } = await requireCustomer();
    await settingsService().requestDeletion(workspaceId, z.string().max(120).parse(confirmName));
    refresh();
    return ok(undefined, "Đã lên lịch xóa workspace sau 30 ngày, đăng bài đã tạm dừng");
  });
}

export async function cancelDeletionAction() {
  return handleAction(async () => {
    const { workspaceId } = await requireCustomer();
    await settingsService().cancelDeletion(workspaceId);
    refresh();
    return ok(undefined, "Đã hủy yêu cầu xóa workspace");
  });
}

export async function changePlanAction(planId: string) {
  return handleAction(async () => {
    const { workspaceId } = await requireCustomer();
    const name = await settingsService().changePlan(workspaceId, changePlanSchema.parse({ planId }).planId);
    refresh();
    return ok(undefined, `Đã chuyển sang gói ${name}`);
  });
}
