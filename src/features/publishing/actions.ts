"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { CHANNEL_MODE } from "@/domain/platform";
import { DomainError, handleAction, ok } from "@/shared/lib/action-result";
import { requireCustomer } from "@/server/auth/dal";
import { repositories } from "@/server/container";

const itemId = z.string().min(1).max(64);

async function findItem(workspaceId: string, id: string) {
  const parsed = itemId.parse(id);
  const item = (await repositories().queue.listByWorkspace(workspaceId)).find((q) => q.id === parsed);
  if (!item) throw new DomainError("Không tìm thấy bài");
  return item;
}

/** Người dùng xác nhận đã đăng tay bài Group / video TikTok */
export async function markPostedAction(id: string) {
  return handleAction(async () => {
    const { workspaceId } = await requireCustomer();
    const item = await findItem(workspaceId, id);
    if (CHANNEL_MODE[item.channel] !== "manual") throw new DomainError("Bài này được đăng tự động");
    await repositories().queue.update(workspaceId, item.id, { status: "posted" });
    refresh();
    return ok(undefined, "Đã ghi nhận, sẽ theo dõi hiệu quả bài này");
  });
}

/** Gỡ bài Facebook Page đã lên lịch nhưng chưa đăng */
export async function unscheduleAction(id: string) {
  return handleAction(async () => {
    const { workspaceId } = await requireCustomer();
    const item = await findItem(workspaceId, id);
    if (item.status !== "scheduled") throw new DomainError("Chỉ gỡ được bài chưa đăng");
    await repositories().queue.remove(workspaceId, item.id);
    refresh();
    return ok(undefined, "Đã gỡ khỏi lịch");
  });
}
