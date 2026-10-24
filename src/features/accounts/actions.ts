"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { ACCOUNT_LABEL } from "@/domain/accounts";
import { handleAction, ok } from "@/shared/lib/action-result";
import { requireCustomer } from "@/server/auth/dal";
import { accountService } from "./server/account.service";

const accountKey = z.enum(["meta", "tiktok", "tiktokShop", "shopee", "accessTrade"]);

const connectInput = z.discriminatedUnion("provider", [
  z.object({ provider: z.literal("meta"), pageIds: z.array(z.string().max(64)).min(1, "Chọn ít nhất một Page") }),
  z.object({ provider: z.literal("tiktok") }),
  z.object({
    provider: z.literal("shopee"),
    affiliateId: z.string().trim().min(3, "Nhập Affiliate ID"),
    appId: z.string().trim().regex(/^\d{4,}$/, "App ID là dãy số"),
    secret: z.string().min(8, "Secret có ít nhất 8 ký tự"),
  }),
  z.object({ provider: z.literal("accessTrade"), accessKey: z.string().min(16, "Access key có ít nhất 16 ký tự") }),
]);

/** Mỗi action: kiểm phiên → validate → gọi service → làm mới UI */
async function withWorkspace<T>(fn: (workspaceId: string) => Promise<T>) {
  const { workspaceId } = await requireCustomer();
  const result = await fn(workspaceId);
  refresh();
  return result;
}

export async function connectAccountAction(input: z.input<typeof connectInput>) {
  return handleAction(async () => {
    const parsed = connectInput.parse(input);
    const label = await withWorkspace((ws) => accountService().connect(ws, parsed));
    return ok(undefined, `Đã kết nối ${label}`);
  });
}

export async function disconnectAccountAction(key: z.input<typeof accountKey>) {
  return handleAction(async () => {
    const parsed = accountKey.parse(key);
    await withWorkspace((ws) => accountService().disconnect(ws, parsed));
    return ok(undefined, `Đã ngắt kết nối ${ACCOUNT_LABEL[parsed]}`);
  });
}

export async function renewAccountAction(key: "meta" | "tiktok") {
  return handleAction(async () => {
    const parsed = z.enum(["meta", "tiktok"]).parse(key);
    await withWorkspace((ws) => accountService().renew(ws, parsed));
    return ok(undefined, `Đã làm mới quyền ${ACCOUNT_LABEL[parsed]}`);
  });
}

export async function enableTikTokShopAction() {
  return handleAction(async () => {
    await withWorkspace((ws) => accountService().enableTikTokShop(ws));
    return ok(undefined, "Đã ghi nhận TikTok Shop Affiliate");
  });
}

export async function setPageAutoPostAction(pageId: string, autoPost: boolean) {
  return handleAction(async () => {
    const { id, on } = z.object({ id: z.string().max(64), on: z.boolean() }).parse({ id: pageId, on: autoPost });
    const name = await withWorkspace((ws) => accountService().setPageAutoPost(ws, id, on));
    return ok(undefined, on ? `Sẽ đăng tự động lên ${name}` : `Ngừng đăng lên ${name}`);
  });
}

const groupUrl = z
  .string()
  .trim()
  .regex(/^https?:\/\/(www\.|m\.)?facebook\.com\/groups\/[\w.-]+/i, "Dán link dạng https://facebook.com/groups/...");

export async function addGroupAction(url: string) {
  return handleAction(async () => {
    const parsed = groupUrl.parse(url);
    await withWorkspace((ws) => accountService().addGroup(ws, parsed));
    return ok(undefined, "Đã thêm Group");
  });
}

export async function removeGroupAction(groupId: string) {
  return handleAction(async () => {
    const id = z.string().max(128).parse(groupId);
    await withWorkspace((ws) => accountService().removeGroup(ws, id));
    return ok(undefined, "Đã gỡ Group");
  });
}

export async function testAccountAction(key: "shopee" | "accessTrade") {
  return handleAction(async () => {
    const parsed = z.enum(["shopee", "accessTrade"]).parse(key);
    const { workspaceId } = await requireCustomer();
    return ok(undefined, await accountService().test(workspaceId, parsed));
  });
}
