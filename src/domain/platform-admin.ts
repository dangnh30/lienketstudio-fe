import type { Plan } from "./plan";

/* Nghiệp vụ của khu quản trị nền tảng (SaaS) */

export type CustomerStatus = "active" | "trial" | "overdue" | "locked";

export const CUSTOMER_STATUS: Record<CustomerStatus, { label: string; tone: "ok" | "tiktok" | "warn" | "locked" }> = {
  active: { label: "Đang dùng", tone: "ok" },
  trial: { label: "Dùng thử", tone: "tiktok" },
  overdue: { label: "Quá hạn", tone: "warn" },
  locked: { label: "Đã khóa", tone: "locked" },
};

export type Customer = {
  id: string;
  userId: string;
  workspaceId: string;
  name: string;
  email: string;
  phone: string;
  workspaceName: string;
  planId: Plan["id"];
  status: CustomerStatus;
  /** Trạng thái trước khi khóa, để mở khóa trả lại đúng */
  previousStatus?: CustomerStatus;
  joinedAt: string;
  lastActive: string;
  trialEndsAt?: string;
  lockReason?: string;
  linked: { facebook: boolean; tiktok: boolean; shopee: boolean };
  usage: { products: number; pages: number; links: number; members: number };
};

export type InvoiceStatus = "paid" | "pending" | "failed";

export type Invoice = {
  number: string;
  customerId: string;
  planId: Plan["id"];
  amount: number;
  date: string;
  method: "VietQR" | "MoMo" | "VNPay";
  status: InvoiceStatus;
};

export const INVOICE_STATUS: Record<InvoiceStatus, { label: string; tone: "ok" | "neutral" | "warn" }> = {
  paid: { label: "Đã thanh toán", tone: "ok" },
  pending: { label: "Chờ thanh toán", tone: "neutral" },
  failed: { label: "Thất bại", tone: "warn" },
};

export type TicketStatus = "open" | "pending" | "closed";

export const TICKET_STATUS: Record<TicketStatus, { label: string; tone: "warn" | "neutral" | "ok" }> = {
  open: { label: "Mới", tone: "warn" },
  pending: { label: "Đang xử lý", tone: "neutral" },
  closed: { label: "Đã xong", tone: "ok" },
};

export type TicketMessage = { from: "customer" | "support"; at: string; text: string };

export type Ticket = {
  id: string;
  customerId: string;
  title: string;
  status: TicketStatus;
  priority: "Cao" | "Thường" | "Thấp";
  at: string;
  messages: TicketMessage[];
};

export type AuditKind = "admin" | "security" | "billing";

export type AuditEntry = {
  id: string;
  at: string;
  actor: string;
  action: string;
  target: string;
  ip: string;
  kind: AuditKind;
};

export type PlatformSettings = {
  signupEnabled: boolean;
  trialDays: number;
  requireEmailVerification: boolean;
  broadcastEnabled: boolean;
  broadcast: string;
  maintenance: boolean;
  requireAdmin2fa: boolean;
  adminSessionHours: number;
};

/** % sử dụng so với giới hạn gói */
export function usagePercent(used: number, limit: number) {
  return limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
}
