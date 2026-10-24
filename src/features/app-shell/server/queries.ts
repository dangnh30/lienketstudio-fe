import "server-only";
import { cache } from "react";
import { accountAlerts } from "@/domain/accounts";
import { reviewState } from "@/domain/deal";
import { planName } from "@/domain/plan";
import { requireCustomer } from "@/server/auth/dal";
import { repositories } from "@/server/container";
import type { NavCountKey } from "../nav";

/**
 * Dữ liệu cho khung ứng dụng khách hàng: bộ đếm menu, thông báo, người dùng.
 * Bọc React cache: nhiều vùng Suspense cùng gọi trong một request chỉ truy vấn một lần.
 */
export const getCustomerShell = cache(async () => {
  const ctx = await requireCustomer();
  const { deals, queue, workspaces, matches, accounts, platform } = repositories();
  const [pending, items, workspace, notifications, matchList, linked, settings] = await Promise.all([
    deals.listByWorkspace(ctx.workspaceId, { status: "pending" }),
    queue.listByWorkspace(ctx.workspaceId),
    workspaces.findById(ctx.workspaceId),
    workspaces.listNotifications(ctx.workspaceId),
    matches.listByWorkspace(ctx.workspaceId),
    accounts.get(ctx.workspaceId),
    platform.get(),
  ]);
  if (!workspace) throw new Error("Workspace không tồn tại");

  const counts: Partial<Record<NavCountKey, number>> = {
    review: pending.filter((d) => reviewState(d, workspace.settings.minScore) === "reviewable").length,
    schedule: items.filter((q) => q.status === "ready").length,
    matching: matchList.filter((m) => m.status === "pending").length,
    accounts: accountAlerts(linked),
  };

  return {
    user: { name: ctx.user.name, email: ctx.user.email },
    impersonatedBy: ctx.impersonatedBy,
    workspace: { name: workspace.name, plan: planName(workspace.planId) },
    broadcast: settings.broadcastEnabled ? settings.broadcast : null,
    counts,
    notifications,
  };
});

export type CustomerShell = Awaited<ReturnType<typeof getCustomerShell>>;
