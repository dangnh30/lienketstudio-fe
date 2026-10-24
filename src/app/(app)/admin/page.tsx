import type { Metadata } from "next";
import Link from "next/link";
import { ChartColumn, CircleCheck, CreditCard, Users } from "lucide-react";
import { formatCompact, formatNumber, formatVnd } from "@/shared/lib/format";
import { ButtonLink } from "@/shared/ui/button";
import { Card, CardHeader } from "@/shared/ui/card";
import { ColumnChart, HBars, LineChart } from "@/shared/ui/charts";
import { Kpi, KpiStrip, Note } from "@/shared/ui/kpi";
import { PageHeader } from "@/shared/ui/page-header";
import { Sparkline } from "@/shared/ui/sparkline";
import { Table, TableScroll, Td, Th, Tr } from "@/shared/ui/table";
import { cn } from "@/shared/lib/cn";
import { dayLabel } from "@/shared/lib/format";
import { CustomerStatusBadge } from "@/features/admin/components/badges";
import { getAdminOverview } from "@/features/admin/server/queries";

export const metadata: Metadata = { title: "Tổng quan nền tảng" };
const icon = "size-4";

export default async function AdminHomePage() {
  const d = await getAdminOverview();
  return (
    <>
      <PageHeader title="Tổng quan nền tảng" description="Số liệu mẫu để minh họa bố cục." />
      <KpiStrip>
        <Kpi href="/admin/billing" label="Doanh thu định kỳ tháng" icon={<CreditCard className={icon} />} value={formatVnd(d.mrr)} chart={<Sparkline values={d.mrrSeries} label="Doanh thu 12 tháng" filled />} footer={<span className="text-[12.5px] text-success">↑ 11% so với tháng trước</span>} />
        <Kpi href="/admin/customers" label="Khách hàng" icon={<Users className={icon} />} value={formatNumber(d.total)} chart={<Sparkline values={d.signups.slice(-14).map((s) => s.value)} label="Đăng ký mới 14 ngày" />} footer={<span className="text-[12.5px] text-success">↑ +12 tuần này</span>} />
        <Kpi href="/admin/customers?status=trial" label="Đang dùng thử" icon={<CircleCheck className={icon} />} value={d.trial} footer={<span className="mt-auto"><Note>38% chuyển sang trả phí</Note></span>} />
        <Kpi label="Tỷ lệ rời bỏ tháng" icon={<ChartColumn className={icon} />} iconTone="warn" value="3,2%" footer={<span className="mt-auto"><Note>7 khách hủy trong tháng 10</Note></span>} />
      </KpiStrip>

      <div className="flex flex-wrap items-stretch gap-4">
        <Card padded className="flex-[2_1_460px]">
          <CardHeader title="Doanh thu định kỳ 12 tháng" description="Tổng phí gói của khách đang trả tiền" />
          <div className="mt-2.5">
            <LineChart primary={{ values: d.mrrSeries, name: "Doanh thu" }} labels={d.months} format={(v) => `${formatCompact(v)}₫`} width={640} />
          </div>
        </Card>
        <Card padded className="flex-[1_1_300px]">
          <CardHeader title="Cần xử lý" />
          <ul className="-mx-2.5 mt-1.5">
            {d.alerts.map((a) => (
              <li key={a.title}>
                <Link href={a.href} className="group flex items-center gap-3 rounded-sm px-2.5 py-3 text-ink no-underline hover:bg-soft">
                  <span className={cn("flex size-9 flex-none items-center justify-center rounded-sm font-semibold", a.warn ? "bg-warn-bg text-warn" : "bg-soft text-ink-2")}>{a.count}</span>
                  <div className="min-w-0 flex-1">
                    <b>
                      {a.count} {a.title}
                    </b>
                    <div className="text-[13px] text-muted">{a.note}</div>
                  </div>
                  <span className="text-[13px] font-medium text-muted group-hover:text-accent-ink">Xem</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="flex flex-wrap items-stretch gap-4">
        <Card padded className="flex-[1_1_320px]">
          <CardHeader title="Khách hàng theo gói" description={`Không tính ${d.trial} khách đang dùng thử`} className="mb-3.5" />
          <HBars
            format={formatNumber}
            rows={d.byPlan.map(({ plan, customers }) => ({
              label: plan.name,
              value: customers,
              note: plan.price ? `${formatVnd(customers * plan.price)} mỗi tháng` : "Không tính phí",
            }))}
          />
        </Card>
        <Card padded className="flex-[1.3_1_380px]">
          <CardHeader title="Đăng ký mới 30 ngày" description="3 ngày nhiều nhất được tô đậm" className="mb-1.5" />
          <ColumnChart values={d.signups.map((s) => s.value)} labels={d.signups.map((s, i) => (i % 5 ? "" : dayLabel(s.date)))} format={formatNumber} name="Đăng ký" highlightTop={3} width={560} />
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between gap-3 px-5 pt-[18px] pb-3">
          <h2 className="text-[15px]">Khách hàng mới</h2>
          <ButtonLink href="/admin/customers" size="sm">
            Xem tất cả
          </ButtonLink>
        </div>
        <TableScroll>
          <Table className="min-w-[640px]">
            <thead>
              <tr>
                <Th>Khách hàng</Th>
                <Th>Gói</Th>
                <Th>Trạng thái</Th>
                <Th>Ngày đăng ký</Th>
              </tr>
            </thead>
            <tbody>
              {d.newest.map((c) => (
                <Tr key={c.id}>
                  <Td>
                    <Link href={`/admin/customers/${c.id}`} className="font-medium text-ink">
                      {c.name}
                    </Link>
                    <div className="text-[13px] text-muted">{c.workspaceName}</div>
                  </Td>
                  <Td>{d.plans.get(c.planId)?.name}</Td>
                  <Td>
                    <CustomerStatusBadge status={c.status} />
                  </Td>
                  <Td className="tnum">{c.joinedAt}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableScroll>
      </Card>
    </>
  );
}
