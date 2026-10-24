"use server";

import { refresh } from "next/cache";
import { requireCustomer } from "@/server/auth/dal";
import { repositories } from "@/server/container";

export async function markAllNotificationsReadAction() {
  const { workspaceId } = await requireCustomer();
  await repositories().workspaces.markNotificationsRead(workspaceId);
  refresh();
}
