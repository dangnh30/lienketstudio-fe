import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@/domain/user";
import { repositories } from "@/server/container";
import { readSession } from "./session";

/*
 * Data Access Layer: mọi kiểm tra quyền đi qua đây – trong page, layout VÀ server action.
 * proxy.ts chỉ là lớp chặn nhanh (optimistic), không thay thế được bước này.
 */

export type CustomerContext = { user: User; workspaceId: string; impersonatedBy?: string };

/** User hiện tại (memo theo request bằng React cache), null nếu chưa đăng nhập */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const session = await readSession();
  if (!session) return null;
  return repositories().users.findById(session.userId);
});

/** Bắt buộc là khách hàng (hoặc admin đang đăng nhập thay khách) */
export const requireCustomer = cache(async (): Promise<CustomerContext> => {
  const session = await readSession();
  if (!session) redirect("/login");

  const { users } = repositories();
  if (session.role === "admin") {
    if (!session.impersonating) redirect("/admin");
    const customer = await users.findById(session.impersonating);
    if (!customer?.workspaceId) redirect("/admin");
    return { user: customer, workspaceId: customer.workspaceId, impersonatedBy: session.userId };
  }

  const user = await users.findById(session.userId);
  if (!user?.workspaceId) redirect("/login");
  return { user, workspaceId: user.workspaceId };
});

export const requireAdmin = cache(async (): Promise<User> => {
  const session = await readSession();
  if (!session) redirect("/login?next=/admin");
  if (session.role !== "admin") redirect("/app");
  const user = await repositories().users.findById(session.userId);
  if (!user) redirect("/login");
  return user;
});
