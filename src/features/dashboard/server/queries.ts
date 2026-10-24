import "server-only";
import { reviewState } from "@/domain/deal";
import { requireCustomer } from "@/server/auth/dal";
import { repositories } from "@/server/container";

const TREND_DAYS = 14;

export async function getOverview() {
  const { workspaceId } = await requireCustomer();
  const { deals, queue, workspaces, stats, matches } = repositories();
  const [pending, all, items, workspace, daily, matchList] = await Promise.all([
    deals.listByWorkspace(workspaceId, { status: "pending" }),
    deals.listByWorkspace(workspaceId),
    queue.listByWorkspace(workspaceId),
    workspaces.findById(workspaceId),
    stats.daily(workspaceId, TREND_DAYS * 2),
    matches.listByWorkspace(workspaceId),
  ]);
  if (!workspace) throw new Error("Workspace không tồn tại");

  const dealName = new Map(all.map((d) => [d.id, d.name]));
  const ready = items.filter((q) => q.status === "ready");
  const current = daily.slice(-TREND_DAYS);
  const previous = daily.slice(0, TREND_DAYS);
  const sum = (rows: typeof daily) => rows.reduce((t, r) => t + r.commission, 0);
  const commission = sum(current);
  const previousCommission = sum(previous);

  return {
    niches: workspace.niches.filter((n) => n.enabled).map((n) => n.name),
    paused: workspace.paused,
    reviewCount: pending.filter((d) => reviewState(d, workspace.settings.minScore) === "reviewable").length,
    tiktokReady: ready.filter((q) => q.channel === "tiktok").length,
    groupReady: ready.filter((q) => q.channel === "fbgroup").length,
    matchPending: matchList.filter((m) => m.status === "pending").length,
    fbPage: {
      posted: workspace.postedFbPageToday,
      cap: workspace.settings.capFbPagePerDay,
      items: items
        .filter((q) => q.channel === "fbpage")
        .sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""))
        .map((q) => ({ ...q, dealName: dealName.get(q.dealId) ?? q.dealId })),
    },
    commission: {
      total: commission,
      changePercent: previousCommission ? Math.round(((commission - previousCommission) / previousCommission) * 100) : 0,
      series: current.map((r) => r.commission),
    },
  };
}
