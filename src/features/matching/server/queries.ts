import "server-only";
import { requireCustomer } from "@/server/auth/dal";
import { repositories } from "@/server/container";

export async function getMatches() {
  const { workspaceId } = await requireCustomer();
  const { matches, deals } = repositories();
  const [list, allDeals] = await Promise.all([matches.listByWorkspace(workspaceId), deals.listByWorkspace(workspaceId)]);
  const byId = new Map(allDeals.map((d) => [d.id, d]));
  return list.flatMap((m) => {
    const deal = byId.get(m.dealId);
    return deal ? [{ ...m, deal }] : [];
  });
}

export type MatchView = Awaited<ReturnType<typeof getMatches>>[number];
