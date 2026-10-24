import type { Metadata } from "next";
import { ReviewTable } from "@/features/deals/components/review-table";
import { getReviewData } from "@/features/deals/server/queries";

export const metadata: Metadata = { title: "Duyệt deal" };

export default async function ReviewPage() {
  const { deals, settings } = await getReviewData();
  return <ReviewTable deals={deals} minScore={settings.minScore} />;
}
