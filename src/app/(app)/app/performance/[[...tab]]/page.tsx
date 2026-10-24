import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/page-header";
import { Segment, Segmented } from "@/shared/ui/segmented";
import { requireCustomer } from "@/server/auth/dal";
import { FilterTab, PostsTab, RevenueTab } from "@/features/analytics/components/performance-tabs";
import { RangePicker } from "@/features/analytics/components/range-picker";
import { parseRange, PERFORMANCE_TABS, type PerformanceTab as Tab } from "@/features/analytics/range";
import { analyticsService } from "@/features/analytics/server/analytics.service";

export const metadata: Metadata = { title: "Thống kê" };

export default async function PerformancePage({ params, searchParams }: PageProps<"/app/performance/[[...tab]]">) {
  const [{ tab: segments = [] }, query] = await Promise.all([params, searchParams]);
  const tab = (segments[0] ?? "revenue") as Tab;
  if (!(tab in PERFORMANCE_TABS) || segments.length > 1) notFound();

  const days = parseRange(query.range);
  const { workspaceId } = await requireCustomer();
  const service = analyticsService();
  const basePath = `/app/performance/${tab}`;

  return (
    <>
      <PageHeader
        title="Thống kê"
        description="Đơn và hoa hồng lấy từ báo cáo AccessTrade và Shopee, lượt xem TikTok từ Display API"
        actions={
          <>
            <RangePicker basePath={basePath} current={days} />
            <ButtonLink href={`/app/export?type=performance&range=${days}`} size="sm" prefetch={false}>
              Xuất báo cáo
            </ButtonLink>
          </>
        }
      />
      <Segmented label="Nhóm thống kê">
        {(Object.keys(PERFORMANCE_TABS) as Tab[]).map((t) => (
          <Segment key={t} href={`/app/performance/${t}?range=${days}`} active={t === tab}>
            {PERFORMANCE_TABS[t]}
          </Segment>
        ))}
      </Segmented>

      {tab === "revenue" && <RevenueTab data={await service.revenue(workspaceId, days)} days={days} />}
      {tab === "posts" && <PostsTab data={await service.posts(workspaceId, days)} days={days} />}
      {tab === "filter" && <FilterTab data={await service.funnel(workspaceId, days)} days={days} />}

      <p className="text-[13px] text-muted">
        Số liệu mẫu để minh họa bố cục. Hoa hồng &quot;chờ duyệt&quot; có thể bị sàn hủy nếu khách trả hàng.
      </p>
    </>
  );
}
