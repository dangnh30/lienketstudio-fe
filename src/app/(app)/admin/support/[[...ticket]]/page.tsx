import type { Metadata } from "next";
import Link from "next/link";
import { cn } from "@/shared/lib/cn";
import { ActionButton } from "@/shared/ui/action-button";
import { Badge } from "@/shared/ui/badge";
import { EmptyState } from "@/shared/ui/banner";
import { Card } from "@/shared/ui/card";
import { PageHeader } from "@/shared/ui/page-header";
import { setTicketStatusAction } from "@/features/admin/actions";
import { ReplyForm } from "@/features/admin/components/admin-controls";
import { TicketStatusBadge } from "@/features/admin/components/badges";
import { getSupport } from "@/features/admin/server/queries";

export const metadata: Metadata = { title: "Hỗ trợ" };

export default async function SupportPage({ params }: PageProps<"/admin/support/[[...ticket]]">) {
  const { ticket = [] } = await params;
  const { tickets, current, customers, plans } = await getSupport(ticket[0]);
  const customer = current ? customers.get(current.customerId) : undefined;

  return (
    <>
      <PageHeader
        title="Hỗ trợ"
        description={`${tickets.filter((t) => t.status === "open").length} yêu cầu mới, ${tickets.filter((t) => t.status === "pending").length} đang xử lý`}
      />
      {!current ? (
        <EmptyState>Chưa có yêu cầu hỗ trợ nào.</EmptyState>
      ) : (
        <div className="grid grid-cols-[minmax(260px,340px)_1fr] items-start gap-4 max-[900px]:grid-cols-1">
          <Card className="flex flex-col overflow-hidden">
            <nav aria-label="Danh sách yêu cầu">
              {tickets.map((t) => (
                <Link
                  key={t.id}
                  href={`/admin/support/${t.id}`}
                  aria-current={t.id === current.id ? "page" : undefined}
                  className={cn(
                    "flex flex-col gap-[5px] border-t border-line-2 px-3.5 py-3 text-[13.5px] text-ink no-underline first:border-t-0 hover:bg-hover",
                    t.id === current.id && "bg-accent-row shadow-[inset_2px_0_0_var(--color-accent)]",
                  )}
                >
                  <div className="flex justify-between gap-2">
                    <b>{customers.get(t.customerId)?.name}</b>
                    <span className="text-[13px] text-muted">{t.at}</span>
                  </div>
                  <div className="text-[13px] text-ink-2">{t.title}</div>
                  <div className="flex gap-1.5">
                    <TicketStatusBadge status={t.status} />
                    {t.priority === "Cao" && <Badge tone="warn">Ưu tiên cao</Badge>}
                  </div>
                </Link>
              ))}
            </nav>
          </Card>

          <Card className="flex flex-col overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-2 px-5 py-[18px]">
              <div className="min-w-0">
                <h2 className="text-[15px]">{current.title}</h2>
                {customer && (
                  <div className="text-[13px] text-muted">
                    <Link href={`/admin/customers/${customer.id}`}>{customer.name}</Link>, gói {plans.get(customer.planId)?.name}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <TicketStatusBadge status={current.status} />
                {current.status !== "closed" ? (
                  <ActionButton action={setTicketStatusAction.bind(null, current.id, "closed")}>Đánh dấu đã xong</ActionButton>
                ) : (
                  <ActionButton action={setTicketStatusAction.bind(null, current.id, "open")}>Mở lại</ActionButton>
                )}
              </div>
            </div>
            <ol className="flex flex-col gap-3.5 bg-[#fcfcfc] px-5 py-[18px]" aria-label="Hội thoại">
              {current.messages.map((m, i) => (
                <li key={i} className={cn("flex max-w-[78%] flex-col items-start gap-1", m.from === "support" && "items-end self-end")}>
                  <div className={cn("rounded-md border border-line bg-white px-3 py-2.5 text-sm", m.from === "support" && "border-transparent bg-accent-bg")}>{m.text}</div>
                  <span className="text-[13px] text-muted">
                    {m.from === "support" ? "Hỗ trợ" : customer?.name}, {m.at}
                  </span>
                </li>
              ))}
            </ol>
            {customer && <ReplyForm ticketId={current.id} customerName={customer.name} />}
          </Card>
        </div>
      )}
    </>
  );
}
