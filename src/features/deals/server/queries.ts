import "server-only";
import { requireCustomer } from "@/server/auth/dal";
import { repositories } from "@/server/container";

/** Dữ liệu màn Duyệt deal (riêng tư theo workspace – không cache server) */
export async function getReviewData() {
  const { workspaceId } = await requireCustomer();
  const { deals, workspaces } = repositories();
  const [pending, workspace] = await Promise.all([
    deals.listByWorkspace(workspaceId, { status: "pending" }),
    workspaces.findById(workspaceId),
  ]);
  if (!workspace) throw new Error("Workspace không tồn tại");
  return { deals: pending, settings: workspace.settings };
}
