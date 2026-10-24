"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { handleAction, ok } from "@/shared/lib/action-result";
import { requireCustomer } from "@/server/auth/dal";
import { repositories } from "@/server/container";

const input = z.object({ matchId: z.string().min(1).max(64), status: z.enum(["pending", "confirmed", "rejected"]) });

const MESSAGE = {
  confirmed: "Đã ghép, sẽ so giá hai sàn",
  rejected: "Đã từ chối gợi ý",
  pending: "Đã hoàn tác",
} as const;

export async function decideMatchAction(matchId: string, status: z.input<typeof input>["status"]) {
  return handleAction(async () => {
    const { workspaceId } = await requireCustomer();
    const parsed = input.parse({ matchId, status });
    await repositories().matches.setStatus(workspaceId, parsed.matchId, parsed.status);
    refresh();
    return ok(undefined, MESSAGE[parsed.status]);
  });
}
