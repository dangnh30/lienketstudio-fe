"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { handleAction, ok } from "@/shared/lib/action-result";
import { requireCustomer } from "@/server/auth/dal";
import { repositories } from "@/server/container";

const input = z.object({ code: z.string().regex(/^[a-z0-9]{2,16}$/), enabled: z.boolean() });

/** Tắt link: người bấm sẽ thấy trang báo link hết hạn thay vì chuyển sang sàn */
export async function setLinkEnabledAction(code: string, enabled: boolean) {
  return handleAction(async () => {
    const { workspaceId } = await requireCustomer();
    const parsed = input.parse({ code, enabled });
    await repositories().links.setEnabled(workspaceId, parsed.code, parsed.enabled);
    refresh();
    return ok(undefined, parsed.enabled ? `Đã bật lại link ${parsed.code}` : `Đã tắt link ${parsed.code}`);
  });
}
