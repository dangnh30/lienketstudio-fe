import "server-only";
import { cache } from "react";
import type { Plan } from "@/domain/plan";
import type { AuditKind, CustomerStatus, InvoiceStatus } from "@/domain/platform-admin";
import { requireAdmin } from "@/server/auth/dal";
import { repositories } from "@/server/container";
import { simulateDailyStats } from "@/server/db/seed";

/* Mọi truy vấn khu quản trị đều gọi requireAdmin() trước khi đọc dữ liệu */

/** Số khách theo gói trên toàn nền tảng (bản mock: số liệu tổng hợp, không chỉ 12 khách mẫu) */
const PLATFORM_TOTALS = { byPlan: { free: 27, basic: 120, pro: 52, team: 8 } as Record<Plan["id"], number>, trial: 41, total: 248 };

export const getAdminCounts = cache(async () => {
  await requireAdmin();
  const { customers, invoices, tickets } = repositories();
  const [c, i, t] = await Promise.all([customers.list(), invoices.list(), tickets.list()]);
  return {
    customers: c.filter((x) => x.status === "overdue").length,
    billing: i.filter((x) => x.status !== "paid").length,
    support: t.filter((x) => x.status === "open").length,
  };
});

export async function getAdminOverview() {
  await requireAdmin();
  const { customers, invoices, tickets, plans } = repositories();
  const [cs, inv, tk, planList] = await Promise.all([customers.list(), invoices.list(), tickets.list(), plans.list()]);
  const mrr = planList.reduce((s, p) => s + PLATFORM_TOTALS.byPlan[p.id] * p.price, 0);
  const months = ["11/25", "12/25", "1/26", "2/26", "3/26", "4/26", "5/26", "6/26", "7/26", "8/26", "9/26", "10/26"];
  const mrrSeries = [4.2, 6.1, 8.8, 11.5, 14.9, 18.2, 21.7, 25.4, 28.8, 32.1, 35.6, mrr / 1e6].map((v) => Math.round(v * 1e6));
  const signups = simulateDailyStats(30, 77).map((r) => ({ date: r.date, value: Math.max(1, Math.round(r.clicks / 22)) }));
  const sortKey = (d: string) => d.split("/").reverse().join("");

  return {
    mrr,
    mrrSeries,
    months,
    total: PLATFORM_TOTALS.total,
    trial: PLATFORM_TOTALS.trial,
    byPlan: planList.map((p) => ({ plan: p, customers: PLATFORM_TOTALS.byPlan[p.id] })),
    signups,
    alerts: [
      { count: inv.filter((i) => i.status === "failed").length, title: "thanh toán thất bại", note: "Thẻ bị từ chối hoặc ví không đủ số dư", href: "/admin/billing", warn: true },
      { count: cs.filter((c) => c.status === "overdue").length, title: "khách hàng quá hạn", note: "Sẽ tự khóa đăng bài sau 7 ngày quá hạn", href: "/admin/customers?status=overdue", warn: true },
      { count: tk.filter((t) => t.status === "open").length, title: "yêu cầu hỗ trợ mới", note: "Chưa có ai trả lời", href: "/admin/support", warn: false },
      { count: 5, title: "khách có quyền Facebook sắp hết hạn", note: "Đã gửi email nhắc làm mới quyền", href: "/admin/customers", warn: false },
    ].filter((a) => a.count > 0),
    newest: [...cs].sort((a, b) => sortKey(b.joinedAt).localeCompare(sortKey(a.joinedAt))).slice(0, 4),
    plans: new Map(planList.map((p) => [p.id, p])),
  };
}

export async function getCustomers(filter: { status?: CustomerStatus; q?: string }) {
  await requireAdmin();
  const { customers, plans } = repositories();
  const [list, planList] = await Promise.all([customers.list(), plans.list()]);
  const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").toLowerCase();
  const q = filter.q ? norm(filter.q.trim()) : "";
  const counts = Object.fromEntries((["active", "trial", "overdue", "locked"] as const).map((s) => [s, list.filter((c) => c.status === s).length]));
  return {
    all: list.length,
    counts: counts as Record<CustomerStatus, number>,
    plans: new Map(planList.map((p) => [p.id, p])),
    customers: list.filter(
      (c) => (!filter.status || c.status === filter.status) && (!q || norm(`${c.name} ${c.email} ${c.workspaceName}`).includes(q)),
    ),
  };
}

export async function getCustomerDetail(customerId: string) {
  await requireAdmin();
  const { customers, plans, invoices, tickets } = repositories();
  const customer = await customers.findById(customerId);
  if (!customer) return null;
  const [planList, inv, tks] = await Promise.all([plans.list(), invoices.list({ customerId }), tickets.list({ customerId })]);
  const plan = planList.find((p) => p.id === customer.planId)!;
  return { customer, plan, plans: planList, invoices: inv, tickets: tks };
}

export async function getPlans() {
  await requireAdmin();
  const [planList, platform] = await Promise.all([repositories().plans.list(), repositories().platform.get()]);
  return { plans: planList.map((p) => ({ ...p, customers: PLATFORM_TOTALS.byPlan[p.id] })), trialDays: platform.trialDays };
}

export async function getBilling(status?: InvoiceStatus) {
  await requireAdmin();
  const { invoices, customers, plans } = repositories();
  const [all, cs, planList] = await Promise.all([invoices.list(), customers.list(), plans.list()]);
  const total = (st: InvoiceStatus) => all.filter((i) => i.status === st).reduce((s, i) => s + i.amount, 0);
  return {
    invoices: all.filter((i) => !status || i.status === status),
    customers: new Map(cs.map((c) => [c.id, c])),
    plans: new Map(planList.map((p) => [p.id, p])),
    pendingTotal: total("pending"),
    pendingCount: all.filter((i) => i.status === "pending").length,
    failedTotal: total("failed"),
    failedCount: all.filter((i) => i.status === "failed").length,
    // Doanh thu tổng hợp toàn nền tảng (mock)
    monthRevenue: 38_900_000,
    revenueMonths: ["5/26", "6/26", "7/26", "8/26", "9/26", "10/26"],
    revenueSeries: [21.7, 25.4, 28.8, 32.1, 35.6, 38.9].map((v) => Math.round(v * 1e6)),
    methods: [
      { label: "Chuyển khoản VietQR", share: 0.56 },
      { label: "Ví MoMo", share: 0.29 },
      { label: "VNPay (thẻ ATM, thẻ quốc tế)", share: 0.15 },
    ],
  };
}

export async function getSupport(ticketId?: string) {
  await requireAdmin();
  const { tickets, customers, plans } = repositories();
  const [list, cs, planList] = await Promise.all([tickets.list(), customers.list(), plans.list()]);
  const current = list.find((t) => t.id === ticketId) ?? list.find((t) => t.status !== "closed") ?? list[0] ?? null;
  return { tickets: list, current, customers: new Map(cs.map((c) => [c.id, c])), plans: new Map(planList.map((p) => [p.id, p])) };
}

export async function getAudit(kind?: AuditKind) {
  await requireAdmin();
  return repositories().audit.list({ kind });
}

export async function getPlatformSettings() {
  await requireAdmin();
  return repositories().platform.get();
}
