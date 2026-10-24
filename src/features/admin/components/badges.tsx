import { CUSTOMER_STATUS, INVOICE_STATUS, TICKET_STATUS, type Customer, type CustomerStatus, type InvoiceStatus, type TicketStatus } from "@/domain/platform-admin";
import { cn } from "@/shared/lib/cn";
import { initials } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/badge";

export const CustomerStatusBadge = ({ status }: { status: CustomerStatus }) => (
  <Badge tone={CUSTOMER_STATUS[status].tone}>{CUSTOMER_STATUS[status].label}</Badge>
);

export const InvoiceStatusBadge = ({ status }: { status: InvoiceStatus }) => (
  <Badge tone={INVOICE_STATUS[status].tone}>{INVOICE_STATUS[status].label}</Badge>
);

export const TicketStatusBadge = ({ status }: { status: TicketStatus }) => (
  <Badge tone={TICKET_STATUS[status].tone}>{TICKET_STATUS[status].label}</Badge>
);

/** Ba ô nhỏ: đã nối Facebook / TikTok / Shopee chưa */
export function LinkedDots({ linked }: { linked: Customer["linked"] }) {
  const items = [
    ["f", linked.facebook, "Facebook"],
    ["♪", linked.tiktok, "TikTok"],
    ["S", linked.shopee, "Shopee"],
  ] as const;
  return (
    <span className="inline-flex gap-1" aria-label={items.map(([, on, n]) => `${n} ${on ? "đã nối" : "chưa nối"}`).join(", ")}>
      {items.map(([ch, on, n]) => (
        <i
          key={n}
          title={n}
          className={cn(
            "inline-flex size-5 items-center justify-center rounded-[3px] text-[10.5px] font-semibold not-italic",
            on ? "bg-[#e8eef9] text-[#1f4fa8]" : "bg-soft text-[#c4c4cc]",
          )}
        >
          {ch}
        </i>
      ))}
    </span>
  );
}

const AVATAR_COLORS = ["#52525B", "#7C5E3C", "#3F5F7F", "#6B4E71"];

export function CustomerAvatar({ customer }: { customer: Pick<Customer, "id" | "name"> }) {
  return (
    <span
      className="inline-flex size-8 flex-none items-center justify-center rounded-full text-xs font-semibold text-white"
      style={{ background: AVATAR_COLORS[customer.id.charCodeAt(2) % AVATAR_COLORS.length] }}
      aria-hidden="true"
    >
      {initials(customer.name)}
    </span>
  );
}
