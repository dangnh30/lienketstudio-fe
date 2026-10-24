import "server-only";
import type { Deal } from "@/domain/deal";
import { CHANNELS, type Channel } from "@/domain/platform";
import type { QueueItem } from "@/domain/publishing";
import { requireCustomer } from "@/server/auth/dal";
import { repositories } from "@/server/container";

export type ScheduleEntry = QueueItem & { deal: Deal };

export async function getSchedule(channel: Channel) {
  const { workspaceId } = await requireCustomer();
  const { deals, queue, workspaces } = repositories();
  const [items, allDeals, workspace] = await Promise.all([
    queue.listByWorkspace(workspaceId),
    deals.listByWorkspace(workspaceId),
    workspaces.findById(workspaceId),
  ]);
  if (!workspace) throw new Error("Workspace không tồn tại");

  const byId = new Map(allDeals.map((d) => [d.id, d]));
  const entries: ScheduleEntry[] = items
    .filter((q) => q.channel === channel && byId.has(q.dealId))
    .map((q) => ({ ...q, deal: byId.get(q.dealId)! }))
    .sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));

  const readyCounts = Object.fromEntries(
    CHANNELS.map((c) => [c, items.filter((q) => q.channel === c && q.status === "ready").length]),
  ) as Record<Channel, number>;

  return { entries, readyCounts, settings: workspace.settings, postedToday: workspace.postedFbPageToday, paused: workspace.paused };
}
