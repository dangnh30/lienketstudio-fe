import type { Deal, Offer } from "@/domain/deal";
import type { QueueItem } from "@/domain/publishing";
import type { User } from "@/domain/user";
import type { ConnectedAccounts } from "@/domain/accounts";
import type { ProductMatch, ShortLink } from "@/domain/catalog";
import type { Plan } from "@/domain/plan";
import type { Notification, Workspace } from "@/domain/workspace";
import { slugify } from "@/shared/lib/format";
import { DEMO_WORKSPACE_ID, seedCustomers } from "./seed-platform";

/* Dữ liệu mẫu – chuyển nguyên từ design/mockup.html để UI khớp thiết kế. */

export { DEMO_WORKSPACE_ID };

/** Sinh lịch sử giá giả lập, có định (cùng seed => cùng kết quả) */
function simulateHistory(avg: number, final: number, low: number, high: number, seed: number) {
  const points: number[] = [];
  let s = seed;
  for (let i = 0; i < 12; i++) {
    s = (s * 9301 + 49297) % 233280;
    points.push(Math.round((avg * (0.94 + (s / 233280) * 0.12)) / 1000) * 1000);
  }
  points[3] = high;
  points[6] = low;
  points.push(final);
  return points;
}

const sp = (o: Omit<Offer, "platform">): Offer => ({ platform: "shopee", ...o });
const tt = (o: Omit<Offer, "platform">): Offer => ({ platform: "tiktokshop", ...o });

type DealSeed = Omit<Deal, "slug" | "priceHistory" | "channels"> & { priceHistory?: number[] };

const DEALS: DealSeed[] = [
  {
    id: "a", name: "Tai nghe chống ồn [Model A]", avg30: 1570000, low90: 1250000, high90: 1890000, score: 86, status: "pending", flag: null,
    offers: [
      sp({ listPrice: 1590000, finalPrice: 1290000, coupon: 100000, commissionRate: 6, inStock: true, checkedAt: "10:42" }),
      tt({ listPrice: 1490000, finalPrice: 1349000, coupon: 0, commissionRate: 8, inStock: true, checkedAt: "10:40" }),
    ],
    priceHistory: [1790000, 1790000, 1690000, 1890000, 1590000, 1590000, 1250000, 1590000, 1690000, 1590000, 1550000, 1590000, 1290000],
  },
  {
    id: "b", name: "Tai nghe true wireless [Model B]", avg30: 588000, low90: 449000, high90: 650000, score: 81, status: "pending", flag: null,
    offers: [tt({ listPrice: 590000, finalPrice: 459000, coupon: 0, commissionRate: 12, inStock: true, checkedAt: "10:39" })],
  },
  {
    id: "c", name: "Tai nghe gaming [Model C]", avg30: 784000, low90: 640000, high90: 850000, score: 72, status: "pending", flag: null,
    offers: [
      sp({ listPrice: 790000, finalPrice: 690000, coupon: 50000, commissionRate: 5, inStock: true, checkedAt: "10:36" }),
      tt({ listPrice: 760000, finalPrice: 715000, coupon: 0, commissionRate: 9, inStock: true, checkedAt: "10:30" }),
    ],
  },
  {
    id: "d", name: "Tai nghe chụp tai [Model D]", avg30: 873000, low90: 820000, high90: 1290000, score: 0, status: "pending", flag: "fake",
    note: "Giá tăng 40% trong 7 ngày trước khi giảm",
    offers: [tt({ listPrice: 1290000, finalPrice: 899000, coupon: 0, commissionRate: 10, inStock: true, checkedAt: "10:20" })],
  },
  {
    id: "e", name: "Tai nghe thể thao [Model E]", avg30: 465000, low90: 349000, high90: 499000, score: 79, status: "pending", flag: "oos",
    note: "Hết hàng khi gọi lại API",
    offers: [sp({ listPrice: 465000, finalPrice: 349000, coupon: 0, commissionRate: 7, inStock: false, checkedAt: "10:35" })],
  },
  {
    id: "g", name: "Tai nghe thể thao [Model G]", avg30: 474000, low90: 369000, high90: 520000, score: 78, status: "approved", flag: null,
    offers: [
      tt({ listPrice: 499000, finalPrice: 379000, coupon: 0, commissionRate: 11, inStock: true, checkedAt: "09:50" }),
      sp({ listPrice: 489000, finalPrice: 399000, coupon: 0, commissionRate: 6, inStock: true, checkedAt: "09:52" }),
    ],
  },
  {
    id: "h", name: "Tai nghe chụp tai [Model H]", avg30: 1353000, low90: 1090000, high90: 1490000, score: 74, status: "approved", flag: null,
    offers: [sp({ listPrice: 1390000, finalPrice: 1150000, coupon: 0, commissionRate: 4, inStock: true, checkedAt: "09:30" })],
  },
];

export function seedDeals(): Deal[] {
  return DEALS.map((d, i) => {
    const hasTikTok = d.offers.some((o) => o.platform === "tiktokshop");
    const cheapest = Math.min(...d.offers.map((o) => o.finalPrice));
    return {
      ...d,
      slug: slugify(d.name),
      priceHistory: d.priceHistory ?? simulateHistory(d.avg30, cheapest, d.low90, d.high90, i * 97 + 13),
      channels: { fbpage: true, fbgroup: d.id !== "b", tiktok: hasTikTok && d.id !== "c" },
    };
  });
}

export function seedQueue(): QueueItem[] {
  return [
    { id: "q1", dealId: "h", channel: "fbpage", time: "08:30", status: "posted" },
    { id: "q2", dealId: "g", channel: "fbpage", time: "10:00", status: "posted" },
    { id: "q3", dealId: "g", channel: "fbgroup", time: null, status: "ready" },
    { id: "q4", dealId: "g", channel: "tiktok", time: null, status: "ready" },
    { id: "q5", dealId: "h", channel: "fbpage", time: "20:00", status: "scheduled" },
  ];
}

export function seedNotifications(): Notification[] {
  return [
    { id: "n1", time: "10:41", text: "Gói video TikTok cho [Model G] đã sẵn sàng", read: false, href: "/app/schedule/tiktok" },
    { id: "n2", time: "10:20", text: "[Model D] bị gắn cờ giảm giá ảo", read: false, href: "/app/review" },
    { id: "n3", time: "08:00", text: "AccessTrade vượt giới hạn tần suất, đã tự thử lại", read: true, href: "/app/sources" },
  ];
}

export function seedWorkspace(id = DEMO_WORKSPACE_ID, name = "Săn deal tai nghe", planId: Plan["id"] = "pro"): Workspace {
  return {
    id,
    name,
    planId,
    niches: [
      { name: "Tai nghe", enabled: true },
      { name: "Đồ gia dụng nhà bếp", enabled: false },
    ],
    settings: {
      minDrop: 15,
      minScore: 70,
      fakeRise: 20,
      minCommission: 3,
      capFbPagePerDay: 10,
      capFbGroupPerDay: 5,
      disclosure:
        "Bài có chứa link tiếp thị liên kết. Mình nhận hoa hồng nếu bạn mua qua link, giá bạn trả không đổi.",
      verifyBeforePost: true,
      manualReview: true,
      aiNoClaims: true,
    },
    general: { timezone: "Asia/Ho_Chi_Minh", currency: "VND", quietFrom: "23:00", quietTo: "07:00" },
    scan: {
      hotMinutes: 5,
      tiktokMinutes: 30,
      normalMinutes: 180,
      feedAt: "02:00",
      accessTradeRatePerMinute: 18,
      retries: 3,
      verifyMinutesBeforePost: 5,
    },
    notify: {
      push: true,
      email: true,
      newDeal: true,
      readyToPost: true,
      fakeDeal: true,
      apiError: true,
      tokenExpiry: true,
      dailyDigest: true,
      digestAt: "21:30",
    },
    members: [
      { id: "m1", name: "Bạn", email: "[email chủ hệ thống]", role: "owner" },
      { id: "m2", name: "[Người biên tập]", email: "[email người biên tập]", role: "editor" },
    ],
    postedFbPageToday: 2,
    paused: false,
  };
}

export function seedAccounts(): ConnectedAccounts {
  return {
    meta: {
      connected: true,
      user: "[Tên tài khoản Facebook]",
      expiresInDays: 54,
      scopes: ["pages_show_list", "pages_manage_posts", "pages_read_engagement", "business_management"],
      pages: [
        { id: "p1", name: "[Page chính] Săn deal tai nghe", followers: "12,4k", autoPost: true },
        { id: "p2", name: "[Page phụ] Góc âm thanh", followers: "3,1k", autoPost: false },
      ],
      groups: [
        { id: "g1", name: "[Nhóm] Hội săn deal tai nghe", members: "38k" },
        { id: "g2", name: "[Nhóm] Review tai nghe giá rẻ", members: "21k" },
      ],
    },
    tiktok: { connected: true, user: "@[tên kênh TikTok]", followers: "5,2k", scopes: ["user.info.basic", "video.list"], canUpload: false },
    tiktokShop: { connected: false },
    shopee: { connected: true, user: "[Tên tài khoản Shopee Affiliate]", affiliateId: "[Affiliate ID]" },
    accessTrade: { connected: true, publisher: "[Mã publisher AccessTrade]", campaigns: ["Shopee", "TikTok Shop"] },
  };
}

export function seedMatches(): ProductMatch[] {
  return [
    {
      id: "m_c",
      dealId: "c",
      reason: "Gợi ý tự động: trùng tên và mã model",
      status: "pending",
      candidates: [
        { platform: "shopee", title: "[Tên hiển thị trên Shopee]", modelCode: "[MÃ C]", finalPrice: 690000 },
        { platform: "tiktokshop", title: "[Tên hiển thị trên TikTok Shop]", modelCode: "[MÃ C]", finalPrice: 715000 },
      ],
    },
    {
      id: "m_a",
      dealId: "a",
      reason: "Đã xác nhận · 2 sàn",
      status: "confirmed",
      candidates: [
        { platform: "shopee", title: "[Tên hiển thị trên Shopee]", modelCode: "[MÃ A]", finalPrice: 1290000 },
        { platform: "tiktokshop", title: "[Tên hiển thị trên TikTok Shop]", modelCode: "[MÃ A]", finalPrice: 1349000 },
      ],
    },
  ];
}

export function seedLinks(): ShortLink[] {
  const l = (code: string, dealId: string, channel: ShortLink["channel"], createdAt: string, clicks: number, platformClicks: number, orders: number, enabled = true): ShortLink => ({
    code, dealId, channel, createdAt, clicks, platformClicks, orders, enabled,
  });
  return [
    l("a7k2", "a", "fbpage", "21/10 12:00", 1184, 1012, 41),
    l("g3pq", "g", "fbgroup", "21/10 09:10", 642, 571, 19),
    l("h8wm", "h", "fbpage", "19/10 20:00", 760, 655, 22),
    l("a2zx", "a", "site", "18/10 08:00", 418, 377, 17),
    l("c5tn", "c", "fbpage", "17/10 12:00", 530, 452, 11),
    l("g9de", "g", "fbpage", "16/10 20:00", 388, 309, 9),
    l("b4ka", "b", "site", "15/10 08:00", 296, 268, 12),
    l("e6rr", "e", "fbgroup", "12/10 21:00", 214, 0, 0, false),
  ];
}

/** Chuỗi số liệu giả lập theo ngày (cuối tuần cao hơn, xu hướng tăng dần) – giống mockup */
export function simulateDailyStats(days: number, seed: number, endDate = new Date(2026, 9, 22)) {
  let s = seed;
  return Array.from({ length: days }, (_, i) => {
    s = (s * 9301 + 49297) % 233280;
    const r = s / 233280;
    const dow = (i + 4) % 7;
    const weekend = dow === 5 || dow === 6 ? 1.25 : 1;
    const trend = 0.8 + (0.4 * i) / Math.max(1, days - 1);
    const clicks = Math.round((90 + r * 90) * weekend * trend);
    const orders = Math.max(1, Math.round(clicks * (0.028 + r * 0.02)));
    const date = new Date(endDate);
    date.setDate(endDate.getDate() - (days - 1 - i));
    return {
      date: date.toISOString().slice(0, 10),
      clicks,
      orders,
      commission: orders * (14000 + Math.round(r * 9000)),
    };
  });
}

/** Tài khoản dùng thử. Mật khẩu chung: "demo1234" (chỉ cho môi trường mock). */
export const DEMO_PASSWORD = "demo1234";

export function seedUsers(): User[] {
  return [
    ...seedCustomers().map((c): User => ({ id: c.userId, name: c.name, email: c.email, role: "customer", workspaceId: c.workspaceId })),
    { id: "u_admin", name: "[Tên quản trị viên]", email: "admin@lienket.vn", role: "admin", workspaceId: null },
  ];
}
