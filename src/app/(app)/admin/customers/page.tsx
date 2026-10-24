import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { CUSTOMER_STATUS, type CustomerStatus } from "@/domain/platform-admin";
import { formatNumber, formatVnd } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { inputClassName } from "@/shared/ui/field";
import { PageHeader } from "@/shared/ui/page-header";
import { Segment, Segmented } from "@/shared/ui/segmented";
import { Table, TableScroll, Td, Th, Tr } from "@/shared/ui/table";
import { cn } from "@/shared/lib/cn";
import { CustomerAvatar, CustomerStatusBadge, LinkedDots } from "@/features/admin/components/badges";
import { getCustomers } from "@/features/admin/server/queries";

export const metadata: Metadata = { title: "Khách hàng" };

const STATUSES = Object.keys(CUSTOMER_STATUS) as CustomerStatus[];

export default async function CustomersPage({ searchParams }: PageProps<"/admin/customers">) {
  const query = await searchParams;
  const status = STATUSES.find((s) => s === query.status);
  const q = typeof query.q === "string" ? query.q : "";
  const data = await getCustomers({ status, q });
  const href = (s?: CustomerStatus) => `/admin/customers?${new URLSearchParams({ ...(s ? { status: s } : {}), ...(q ? { q } : {}) })}`;

  return (
    <>
      <PageHeader title="Khách hàng" description={`${data.all} tài khoản trong bản mẫu`} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented label="Lọc trạng thái">
          <Segment href={href()} active={!status}>
            Tất cả <span className="text-muted">{data.all}</span>
          </Segment>
          {STATUSES.map((s) => (
            <Segment key={s} href={href(s)} active={status === s}>
              {CUSTOMER_STATUS[s].label} <span className="text-muted">{data.counts[s]}</span>
            </Segment>
          ))}
        </Segmented>
        {/* Form GET: tìm kiếm chạy cả khi chưa có JS, URL chia sẻ được */}
        <form action="/admin/customers" className="flex w-[340px] max-w-full gap-2" role="search">
          {status && <input type="hidden" name="status" value={status} />}
          <label className="relative flex-1">
            <span className="sr-only">Lọc theo tên, email, workspace</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input name="q" type="search" defaultValue={q} placeholder="Lọc theo tên, email, workspace" className={cn(inputClassName, "pl-9 text-[13.5px]")} />
          </label>
          <Button type="submit" size="md">
            Lọc
          </Button>
        </form>
      </div>

      <Card>
        <TableScroll>
          <Table className="min-w-[920px]">
            <thead>
              <tr>
                <Th>Khách hàng</Th>
                <Th>Workspace</Th>
                <Th>Gói</Th>
                <Th>Trạng thái</Th>
                <Th>Liên kết</Th>
                <Th align="right">Sản phẩm theo dõi</Th>
                <Th>Hoạt động</Th>
              </tr>
            </thead>
            <tbody>
              {data.customers.length === 0 && (
                <tr>
                  <Td colSpan={7} className="text-muted">
                    Không có khách hàng nào khớp bộ lọc.
                  </Td>
                </tr>
              )}
              {data.customers.map((c) => {
                const plan = data.plans.get(c.planId);
                return (
                  <Tr key={c.id}>
                    <Td>
                      <div className="flex items-center gap-2.5">
                        <CustomerAvatar customer={c} />
                        <div className="min-w-0">
                          <Link href={`/admin/customers/${c.id}`} className="font-medium text-ink">
                            {c.name}
                          </Link>
                          <div className="text-[13px] text-muted">{c.email}</div>
                        </div>
                      </div>
                    </Td>
                    <Td>{c.workspaceName}</Td>
                    <Td>
                      {plan?.name}
                      <div className="text-[13px] text-muted">{plan?.price ? formatVnd(plan.price) : "Miễn phí"}</div>
                    </Td>
                    <Td>
                      <CustomerStatusBadge status={c.status} />
                      {c.status === "trial" && c.trialEndsAt && <div className="text-[13px] text-muted">đến {c.trialEndsAt}</div>}
                    </Td>
                    <Td>
                      <LinkedDots linked={c.linked} />
                    </Td>
                    <Td align="right">{formatNumber(c.usage.products)}</Td>
                    <Td className="text-[13px]">{c.lastActive}</Td>
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
