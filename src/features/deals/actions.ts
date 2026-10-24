"use server";

import { refresh, revalidateTag } from "next/cache";
import { z } from "zod";
import { CHANNELS } from "@/domain/platform";
import { handleAction as run, ok } from "@/shared/lib/action-result";
import { requireCustomer } from "@/server/auth/dal";
import { PUBLIC_DEALS_TAG } from "@/features/public-catalog/server/queries";
import { purgeCdn } from "@/server/cdn-purge";
import { dealReviewService } from "./server/deal-review.service";

/*
 * Mỗi action: validate input (zod) → xác thực lại (không tin client) → gọi service
 * → làm mới UI + cache trang công khai → trả ActionResult.
 */

const dealId = z.string().min(1).max(64);

/** Deal được duyệt sẽ xuất hiện trên trang so sánh giá công khai */
async function invalidatePublicCatalog() {
  revalidateTag(PUBLIC_DEALS_TAG, "max");
  await purgeCdn(["/", "/deal"]);
}

export async function approveDealAction(id: string) {
  return run(async () => {
    const { workspaceId } = await requireCustomer();
    const { created } = await dealReviewService().approve(workspaceId, dealId.parse(id));
    await invalidatePublicCatalog();
    refresh();
    return ok({ created }, `Đã duyệt, tạo ${created} bài trong Lịch đăng`);
  });
}

export async function approveManyDealsAction(ids: string[]) {
  return run(async () => {
    const { workspaceId } = await requireCustomer();
    const parsed = z.array(dealId).max(100).parse(ids);
    const result = await dealReviewService().approveMany(workspaceId, parsed);
    if (result.approved) await invalidatePublicCatalog();
    refresh();
    return ok(result, `Đã duyệt ${result.approved} deal, tạo ${result.posts} bài`);
  });
}

export async function skipDealAction(id: string) {
  return run(async () => {
    const { workspaceId } = await requireCustomer();
    await dealReviewService().skip(workspaceId, dealId.parse(id));
    refresh();
    return ok(undefined, "Đã bỏ, sản phẩm vẫn được theo dõi giá");
  });
}

const channelInput = z.object({ dealId, channel: z.enum(CHANNELS), enabled: z.boolean() });

export async function setDealChannelAction(input: z.input<typeof channelInput>) {
  return run(async () => {
    const { workspaceId } = await requireCustomer();
    const { dealId: id, channel, enabled } = channelInput.parse(input);
    await dealReviewService().setChannel(workspaceId, id, channel, enabled);
    return ok(undefined);
  });
}
