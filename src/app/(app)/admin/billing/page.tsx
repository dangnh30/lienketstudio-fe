import type { Metadata } from "next";
import Link from "next/link";
import { CreditCard } from "lucide-react";
import { INVOICE_STATUS, type InvoiceStatus } from "@/domain/platform-admin";
import { formatCompact, formatVnd } from "@/shared/lib/format";
import { ActionButton } from "@/shared/ui/action-button";
import { Card, CardHeader, Code } from "@/shared/ui/card";
import { ColumnChart, HBars } from "@/shared/ui/charts";
import { Kpi, KpiStrip, Note } from "@/shared/ui/kpi";
import { PageHeader } from "@/shared/ui/page-header";
import { Segment, Segmented } from "@/shared/ui/segmented";
import { Table, TableScroll, Td, Th, Tr } from "@/shared/ui/table";
import { markInvoicePaidAction, remindInvoiceAction } from "@/features/admin/actions";
import { InvoiceStatusBadge } from "@/features/admin/components/badges";
import { getBilling } from "@/features/admin/server/queries";

export const metadata: Metadata = { title: "Thanh toán" };

const FILTERS: (InvoiceStatus | undefined)[] = [undefined, "paid", "pending", "failed"];

export default async function BillingPage({ searchParams }: PageProps<"/admin/billing">) {
  const query = await searchParams;
  const status = FILTERS.find((f) => f && f === query.status);
  const d = await getBilling(status);

  return (
    <>
      <PageHeader title="Thanh toán" description="Hóa đơn gói cước của khách hàng" />
      <KpiStrip>
        <Kpi label="Thu tháng 10" value={formatVnd(d.monthRevenue)} footer={<span className="text-[12.5px] text-success">↑ 9% so với tháng 9</span>} />
        <Kpi label="Chờ thanh toán" value={formatVnd(d.pendingTotal)} footer={<Note>{d.pendingCount} hóa đơn</Note>} />
        <Kpi label="Thất bại" icon={<CreditCard className="size-4" />} iconTone="warn" value={formatVnd(d.failedTotal)} footer={<Note>{d.failedCount} hóa đơn cần nhắc khách</Note>} />
        <Kpi label="Doanh thu trung bình mỗi khách" value={formatVnd(216000)} footer={<Note>Khách trả phí</Note>} />
      </KpiStrip>

      <div className="flex flex-wrap items-stretch gap-4">
        <Card padded className="flex-[2_1_460px]">
          <CardHeader title="Doanh thu 6 tháng" />
          <div className="mt-2.5">
            <ColumnChart values={d.revenueSeries} labels={d.revenueMonths} format={formatCompact} name="Doanh thu" highlightTop={1} width={560} />
          </div>
        </Card>
        <Card padded className="flex-[1_1_280px]">
          <CardHeader title="Theo phương thức" description="Tháng 10" className="mb-3.5" />
          <HBars format={formatVnd} rows={d.methods.map((m) => ({ label: m.label, value: d.monthRevenue * m.share }))} />
        </Card>
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-[18px] pb-3">
          <h2 className="text-[15px]">Hóa đơn</h2>
          <Segmented label="Lọc hóa đơn">
            {FILTERS.map((f) => (
              <Segment key={f ?? "all"} href={f ? `/admin/billing?status=${f}` : "/admin/billing"} active={f === status}>
                {f ? INVOICE_STATUS[f].label : "Tất cả"}
              </Segment>
            ))}
          </Segmented>
        </div>
        <TableScroll>
          <Table className="min-w-[860px]">
            <thead>
              <tr>
                <Th>Số hóa đơn</Th>
                <Th>Khách hàng</Th>
                <Th>Gói</Th>
                <Th>Ngày</Th>
                <Th>Phương thức</Th>
                <Th align="right">Số tiền</Th>
                <Th>Trạng thái</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {d.invoices.length === 0 && (
                <tr>
                  <Td colSpan={8} className="text-muted">
                    Không có hóa đơn.
                  </Td>
                </tr>
              )}
              {d.invoices.map((i) => {
                const c = d.customers.get(i.customerId);
                return (
                  <Tr key={i.number}>
                    <Td>
                      <Code subtle>{i.number}</Code>
                    </Td>
                    <Td>{c ? <Link href={`/admin/customers/${c.id}`}>{c.name}</Link> : "—"}</Td>
                    <Td>{d.plans.get(i.planId)?.name}</Td>
                    <Td className="tnum">{i.date}</Td>
                    <Td>{i.method}</Td>
                    <Td align="right">{formatVnd(i.amount)}</Td>
                    <Td>
                      <InvoiceStatusBadge status={i.status} />
                    </Td>
                    <Td align="right">
                      {i.status !== "paid" && (
                        <div className="flex justify-end gap-1.5">
                          <ActionButton action={remindInvoiceAction.bind(null, i.number)}>Gửi nhắc</ActionButton>
                          <ActionButton action={markInvoicePaidAction.bind(null, i.number)}>Đã nhận tiền</ActionButton>
                        </div>
                      )}
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        </TableScroll>
      </Card>
    </>
  );
}
