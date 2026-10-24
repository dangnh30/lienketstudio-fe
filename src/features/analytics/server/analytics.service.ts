import "server-only";
import { conversionRate, matchRate } from "@/domain/catalog";
import { repositories } from "@/server/container";
import type { DailyStat, Repositories } from "@/server/repositories/types";
import { dayLabel, percentChange, type Range } from "../range";

const sum = (rows: DailyStat[], key: keyof Omit<DailyStat, "date">) => rows.reduce((t, r) => t + r[key], 0);

/** Tính các chỉ số Thống kê và Liên kết từ số liệu thô của repository */
export class AnalyticsService {
  constructor(private readonly repos: Repositories) {}

  private async period(workspaceId: string, days: Range) {
    const [current, previous, breakdowns] = await Promise.all([
      this.repos.stats.daily(workspaceId, days),
      this.repos.stats.daily(workspaceId, days, 1),
      this.repos.stats.breakdowns(workspaceId),
    ]);
    const totals = { clicks: sum(current, "clicks"), orders: sum(current, "orders"), commission: sum(current, "commission") };
    const prevTotals = { clicks: sum(previous, "clicks"), orders: sum(previous, "orders"), commission: sum(previous, "commission") };
    return { current, previous, breakdowns, totals, prevTotals, labels: current.map((r) => dayLabel(r.date)) };
  }

  async revenue(workspaceId: string, days: Range) {
    const p = await this.period(workspaceId, days);
    const deals = await this.repos.deals.listByWorkspace(workspaceId);
    const byId = new Map(deals.map((d) => [d.id, d]));
    const hourTotal = p.breakdowns.hours.reduce((t, h) => t + h.weight, 0);

    return {
      ...p,
      change: {
        commission: percentChange(p.totals.commission, p.prevTotals.commission),
        orders: percentChange(p.totals.orders, p.prevTotals.orders),
        clicks: percentChange(p.totals.clicks, p.prevTotals.clicks),
      },
      conversion: conversionRate(p.totals.orders, p.totals.clicks) ?? 0,
      // Hoa hồng "chờ duyệt" có thể bị sàn hủy nếu khách trả hàng
      approvedCommission: p.totals.commission * 0.62,
      pendingCommission: p.totals.commission * 0.38,
      platforms: p.breakdowns.platforms.map((pl) => ({
        ...pl,
        commission: p.totals.commission * pl.commissionShare,
        orders: Math.round(p.totals.orders * pl.orderShare),
      })),
      hours: p.breakdowns.hours.map((h) => ({ label: h.label, orders: Math.round((h.weight * p.totals.orders) / hourTotal) })),
      topProducts: p.breakdowns.topProducts.flatMap((t) => {
        const deal = byId.get(t.dealId);
        if (!deal) return [];
        const clicks = Math.round(p.totals.clicks * t.clickShare);
        const orders = Math.round(p.totals.orders * t.orderShare);
        return [{ deal, clicks, orders, commission: Math.round(p.totals.commission * t.commissionShare) }];
      }),
    };
  }

  async posts(workspaceId: string, days: Range) {
    const p = await this.period(workspaceId, days);
    const postsPerDay = p.breakdowns.channels.reduce((t, c) => t + (c.postsPerDay ?? 0), 0);
    const totalPosts = Math.round(days * postsPerDay);
    return {
      ...p,
      totalPosts,
      clicksPerPost: totalPosts ? p.totals.clicks / totalPosts : 0,
      clicksPerPostChange: percentChange(p.totals.clicks, p.prevTotals.clicks * 1.04),
      tiktokViews: days * 3150,
      droppedBeforePost: Math.round(days * 0.4),
      channels: p.breakdowns.channels.map((c) => {
        const posts = c.postsPerDay === null ? null : Math.round(days * c.postsPerDay);
        const commission = p.totals.commission * c.commissionShare;
        return { ...c, posts, commission, perPost: posts ? commission / posts : null };
      }),
    };
  }

  async funnel(workspaceId: string, days: Range) {
    const [{ funnelPer30Days }, workspace, daily] = await Promise.all([
      this.repos.stats.breakdowns(workspaceId),
      this.repos.workspaces.findById(workspaceId),
      this.repos.stats.daily(workspaceId, Math.min(days, 30), 2),
    ]);
    if (!workspace) throw new Error("Workspace không tồn tại");
    const k = days / 30;
    const s = workspace.settings;
    const v = Object.fromEntries(funnelPer30Days.steps.map((st) => [st.key, Math.round(st.value * k)])) as Record<string, number>;

    const steps = [
      { label: `Giảm từ ${s.minDrop}% so với TB 30 ngày`, value: v.drop },
      { label: "Không bị gắn cờ giảm ảo", value: v.notFake },
      { label: "Còn hàng khi gọi lại API", value: v.inStock },
      { label: `Hoa hồng từ ${s.minCommission}%`, value: v.commission },
      { label: `Đạt từ ${s.minScore} điểm → vào Duyệt deal`, value: v.score },
      { label: "Bạn duyệt", value: v.approved },
      { label: "Đã đăng", value: v.posted },
    ];
    const reasons = [
      { label: `Điểm dưới ${s.minScore}`, value: v.commission - v.score, note: "Giảm ít, ít người mua hoặc đánh giá thấp" },
      { label: "Giảm ảo (tăng giá trước khi giảm)", value: v.drop - v.notFake, note: `Giá tăng hơn ${s.fakeRise}% trong 14 ngày trước` },
      { label: "Hoa hồng thấp", value: v.inStock - v.commission, note: `Dưới ${s.minCommission}%` },
      { label: "Bạn bấm Bỏ", value: v.score - v.approved, note: "Duyệt tay" },
      { label: "Hết hàng", value: v.notFake - v.inStock, note: "Gọi lại API trước khi đưa vào duyệt" },
      { label: "Bỏ trước giờ đăng", value: v.approved - v.posted, note: "Giá đổi hơn 2% hoặc hết hàng lúc đăng" },
    ].sort((a, b) => b.value - a.value);

    return {
      tracked: funnelPer30Days.tracked,
      niches: workspace.niches.filter((n) => n.enabled).map((n) => n.name),
      steps,
      reasons,
      reviewed: v.score,
      approvalRate: v.score ? Math.round((v.approved / v.score) * 100) : 0,
      fakeCaught: v.drop - v.notFake,
      newPerDay: daily.map((r) => ({ label: dayLabel(r.date), value: Math.max(0, Math.round(r.clicks / 45)) })),
    };
  }

  async links(workspaceId: string, days: Range) {
    const [current, breakdowns, links, deals] = await Promise.all([
      this.repos.stats.daily(workspaceId, days),
      this.repos.stats.breakdowns(workspaceId),
      this.repos.links.listByWorkspace(workspaceId),
      this.repos.deals.listByWorkspace(workspaceId),
    ]);
    const own = current.map((r) => r.clicks);
    const platform = current.map((r, i) => Math.round(r.clicks * (0.82 + ((i * 37) % 9) / 100)));
    const bots = current.map((r, i) => Math.round(r.clicks * (0.1 + ((i * 13) % 7) / 100)));
    const total = { own: own.reduce((a, b) => a + b, 0), platform: platform.reduce((a, b) => a + b, 0), bots: bots.reduce((a, b) => a + b, 0) };
    const orders = sum(current, "orders");
    const byId = new Map(deals.map((d) => [d.id, d]));

    return {
      labels: current.map((r) => dayLabel(r.date)),
      series: { own, platform, bots },
      total,
      orders,
      matchPercent: total.own ? Math.round((total.platform / total.own) * 100) : 0,
      conversion: conversionRate(orders, total.platform) ?? 0,
      botPercent: Math.round((total.bots / (total.own + total.bots)) * 100),
      sources: breakdowns.clickSources.map((s) => ({ label: s.label, value: total.own * s.share })),
      devices: breakdowns.devices.map((s) => ({ label: s.label, value: total.own * s.share })),
      regions: breakdowns.regions.map((s) => ({ label: s.label, value: total.own * s.share })),
      filtered: breakdowns.filteredClicks.map((f) => ({ ...f, value: Math.round(total.bots * f.share) })),
      links: links.flatMap((l) => {
        const deal = byId.get(l.dealId);
        return deal ? [{ ...l, deal, match: matchRate(l), conversion: conversionRate(l.orders, l.platformClicks) }] : [];
      }),
    };
  }
}

export const analyticsService = () => new AnalyticsService(repositories());
