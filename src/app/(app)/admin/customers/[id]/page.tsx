import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatVnd } from "@/shared/lib/format";
import { ActionButton } from "@/shared/ui/action-button";
import { Badge } from "@/shared/ui/badge";
import { Banner } from "@/shared/ui/banner";
import { Card, CardHeader, Code, InfoRow, Section, Timeline } from "@/shared/ui/card";
import { Meter, MeterGrid } from "@/shared/ui/meter";
import { PageHeader } from "@/shared/ui/page-header";
import { Table, TableScroll, Td, Th, Tr } from "@/shared/ui/table";
import { extendTrialAction, remindCustomerAction, unlockCustomerAction } from "@/features/admin/actions";
import { CustomerPlanForm, ImpersonateButton, LockCustomerButton } from "@/features/admin/components/admin-controls";
import { CustomerStatusBadge, InvoiceStatusBadge, TicketStatusBadge } from "@/features/admin/components/badges";
import { getCustomerDetail } from "@/features/admin/server/queries";

export const metadata: Metadata = { title: "Chi tiết khách hàng" };

export default async function CustomerDetailPage({ params }: PageProps<"/admin/customers/[id]">) {
  const data = await getCustomerDetail((await params).id);
  if (!data) notFound();
  const { customer: c, plan, plans, invoices, tickets } = data;
  const locked = c.status === "locked";

  return (
    <>
      <Link href="/admin/customers" className="self-start text-[13px] text-muted no-underline hover:text-ink">
        ← Khách hàng
      </Link>
      <PageHeader
        title={
          <>
            {c.name} <CustomerStatusBadge status={c.status} />
          </>
        }
        description={`${c.workspaceName}, đăng ký ${c.joinedAt}`}
        actions={
          <>
            <ImpersonateButton customerId={c.id} disabled={locked} />
            {locked ? <ActionButton action={unlockCustomerAction.bind(null, c.id)}>Mở khóa</ActionButton> : <LockCustomerButton customerId={c.id} name={c.name} />}
          </>
        }
      />
      {locked && (
        <Banner>
          <b>Lý do khóa:</b> {c.lockReason ?? "Không ghi lý do"}
        </Banner>
      )}

      <div className="flex flex-wrap items-stretch gap-4">
        <Card padded className="flex-[1_1_320px]">
          <CardHeader title="Thông tin" className="mb-2" />
          <InfoRow label="Email">{c.email}</InfoRow>
          <InfoRow label="Điện thoại">{c.phone}</InfoRow>
          <InfoRow label="Hoạt động gần nhất">{c.lastActive}</InfoRow>
          <InfoRow label="Tài khoản liên kết">
            <span className="flex flex-wrap gap-1.5">
              {(
                [
                  ["facebook", "Facebook"],
                  ["tiktok", "TikTok"],
                  ["shopee", "Shopee"],
                ] as const
              ).map(([k, label]) => (
                <Badge key={k} tone={c.linked[k] ? "ok" : "neutral"}>
                  {label}
                  {c.linked[k] ? "" : " chưa nối"}
                </Badge>
              ))}
            </span>
          </InfoRow>
        </Card>
        <Section title="Gói cước" className="flex-[1_1_320px]">
          <CustomerPlanForm customerId={c.id} current={c.planId} plans={plans} />
          {c.status === "trial" && (
            <div className="flex flex-wrap items-center justify-between gap-3 text-[13px]">
              <span>
                Dùng thử đến <b>{c.trialEndsAt}</b>
              </span>
              <ActionButton action={extendTrialAction.bind(null, c.id)}>Gia hạn thêm 7 ngày</ActionButton>
            </div>
          )}
          {c.status === "overdue" && (
            <div className="flex flex-wrap items-center justify-between gap-3 text-[13px]">
              <span className="text-warn">Quá hạn thanh toán, tự khóa đăng bài sau 7 ngày</span>
              <ActionButton action={remindCustomerAction.bind(null, c.id)}>Gửi nhắc</ActionButton>
            </div>
          )}
        </Section>
      </div>

      <Section title={`Mức sử dụng so với gói ${plan.name}`}>
        <MeterGrid>
          <Meter label="Sản phẩm theo dõi" used={c.usage.products} limit={plan.products} />
          <Meter label="Facebook Page" used={c.usage.pages} limit={plan.pages} />
          <Meter label="Link rút gọn tháng này" used={c.usage.links} limit={plan.links} />
          <Meter label="Thành viên" used={c.usage.members} limit={plan.members} />
        </MeterGrid>
      </Section>

      <div className="flex flex-wrap items-stretch gap-4">
        <Card className="flex-[1_1_420px]">
          <div className="px-5 pt-[18px] pb-2.5">
            <h2 className="text-[15px]">Hóa đơn</h2>
          </div>
          <TableScroll>
            <Table>
              <thead>
                <tr>
                  <Th>Số</Th>
                  <Th>Ngày</Th>
                  <Th align="right">Số tiền</Th>
                  <Th>Trạng thái</Th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 && (
                  <tr>
                    <Td colSpan={4} className="text-muted">
                      Chưa có hóa đơn.
                    </Td>
                  </tr>
                )}
                {invoices.map((i) => (
                  <Tr key={i.number}>
                    <Td>
                      <Code subtle>{i.number}</Code>
                    </Td>
                    <Td>{i.date}</Td>
                    <Td align="right">{formatVnd(i.amount)}</Td>
                    <Td>
                      <InvoiceStatusBadge status={i.status} />
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </TableScroll>
        </Card>
        <Card padded className="flex-[1_1_320px]">
          <CardHeader title="Yêu cầu hỗ trợ" />
          <ul className="-mx-2.5 mt-1.5">
            {tickets.length === 0 && <li className="px-2.5 text-[13px] text-muted">Chưa có yêu cầu nào.</li>}
            {tickets.map((t) => (
              <li key={t.id}>
                <Link href={`/admin/support/${t.id}`} className="flex items-center gap-3 rounded-sm px-2.5 py-3 text-ink no-underline hover:bg-soft">
                  <div className="min-w-0 flex-1">
                    <b className="font-medium">{t.title}</b>
                    <div className="text-[13px] text-muted">{t.at}</div>
                  </div>
                  <TicketStatusBadge status={t.status} />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Section title="Hoạt động gần đây">
        <Timeline
          items={[
            { at: "10:41", text: "Duyệt 2 deal, tạo 3 bài trong lịch đăng" },
            { at: "10:00", text: "Bài Facebook Page đăng tự động thành công" },
            { at: "08:30", text: "Bài Facebook Page đăng tự động thành công" },
            { at: "hôm qua 21:12", text: "Làm mới quyền Facebook" },
            { at: "hôm qua 09:05", text: "Đổi điểm deal tối thiểu từ 65 lên 70" },
          ]}
        />
      </Section>
    </>
  );
}
