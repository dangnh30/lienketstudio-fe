import "server-only";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { emptyWorkspaceData, memoryDb } from "@/server/db/memory-db";
import { DEMO_PASSWORD, DEMO_WORKSPACE_ID, simulateDailyStats } from "@/server/db/seed";
import { simulateComparison } from "@/server/db/seed-comparison";
import { STATS_BREAKDOWNS } from "@/server/db/seed-stats";
import type {
  AccountRepository,
  ComparisonRepository,
  AuditRepository,
  CustomerRepository,
  DealRepository,
  InvoiceRepository,
  LinkRepository,
  MatchRepository,
  PlanRepository,
  PlatformSettingsRepository,
  QueueRepository,
  Repositories,
  StatsRepository,
  TicketRepository,
  UserRepository,
  WorkspaceRepository,
} from "./types";

/*
 * Implementation in-memory cho môi trường dev/demo.
 * Luôn trả bản sao (structuredClone) để caller không sửa trực tiếp "database".
 */

const clone = structuredClone;

function workspaceData(workspaceId: string) {
  const data = memoryDb().workspaces.get(workspaceId);
  if (!data) throw new Error(`Workspace ${workspaceId} không tồn tại`);
  return data;
}

function mustFind<T>(item: T | undefined, what: string): T {
  if (!item) throw new Error(`${what} không tồn tại`);
  return item;
}

const deals: DealRepository = {
  async listByWorkspace(workspaceId, filter) {
    const list = workspaceData(workspaceId).deals;
    return clone(filter?.status ? list.filter((d) => d.status === filter.status) : list);
  },
  async findById(workspaceId, dealId) {
    const deal = workspaceData(workspaceId).deals.find((d) => d.id === dealId);
    return deal ? clone(deal) : null;
  },
  async update(workspaceId, dealId, patch) {
    const deal = mustFind(workspaceData(workspaceId).deals.find((d) => d.id === dealId), `Deal ${dealId}`);
    Object.assign(deal, patch);
    return clone(deal);
  },
  // Trang so sánh giá công khai (của workspace chủ site): mọi sản phẩm đang theo dõi, trừ sản phẩm bị gắn cờ giảm ảo
  async listPublished() {
    return clone(workspaceData(DEMO_WORKSPACE_ID).deals.filter((d) => d.flag !== "fake"));
  },
  async findPublishedBySlug(slug) {
    const list = await this.listPublished();
    return list.find((d) => d.slug === slug) ?? null;
  },
};

const queue: QueueRepository = {
  async listByWorkspace(workspaceId, channel) {
    const list = workspaceData(workspaceId).queue;
    return clone(channel ? list.filter((q) => q.channel === channel) : list);
  },
  async addMany(workspaceId, items) {
    workspaceData(workspaceId).queue.push(...clone(items));
  },
  async update(workspaceId, itemId, patch) {
    const item = mustFind(workspaceData(workspaceId).queue.find((q) => q.id === itemId), `Mục lịch đăng ${itemId}`);
    Object.assign(item, patch);
    return clone(item);
  },
  async remove(workspaceId, itemId) {
    const data = workspaceData(workspaceId);
    data.queue = data.queue.filter((q) => q.id !== itemId);
  },
};

const workspaces: WorkspaceRepository = {
  async findById(workspaceId) {
    const data = memoryDb().workspaces.get(workspaceId);
    return data ? clone(data.workspace) : null;
  },
  async create(workspace) {
    memoryDb().workspaces.set(workspace.id, emptyWorkspaceData(clone(workspace)));
  },
  async update(workspaceId, patch) {
    const data = workspaceData(workspaceId);
    Object.assign(data.workspace, clone(patch));
    return clone(data.workspace);
  },
  async listNotifications(workspaceId) {
    return clone(workspaceData(workspaceId).notifications);
  },
  async addNotification(workspaceId, notification) {
    workspaceData(workspaceId).notifications.unshift({ id: crypto.randomUUID(), ...notification });
  },
  async markNotificationsRead(workspaceId, ids) {
    for (const n of workspaceData(workspaceId).notifications) {
      if (!ids || ids.includes(n.id)) n.read = true;
    }
  },
};

const accounts: AccountRepository = {
  async get(workspaceId) {
    return clone(workspaceData(workspaceId).accounts);
  },
  async save(workspaceId, value) {
    workspaceData(workspaceId).accounts = clone(value);
  },
};

const matches: MatchRepository = {
  async listByWorkspace(workspaceId) {
    return clone(workspaceData(workspaceId).matches);
  },
  async setStatus(workspaceId, matchId, status) {
    const match = mustFind(workspaceData(workspaceId).matches.find((m) => m.id === matchId), `Gợi ý ${matchId}`);
    match.status = status;
    return clone(match);
  },
};

const links: LinkRepository = {
  async listByWorkspace(workspaceId) {
    return clone(workspaceData(workspaceId).links);
  },
  async setEnabled(workspaceId, code, enabled) {
    const link = mustFind(workspaceData(workspaceId).links.find((l) => l.code === code), `Link ${code}`);
    link.enabled = enabled;
    return clone(link);
  },
};

const comparisons: ComparisonRepository = {
  async forDeal(deal) {
    return simulateComparison(deal);
  },
  // Bản mock: mọi link Shopee hợp lệ đều trỏ tới sản phẩm mẫu đầu tiên có trên Shopee (giống mockup)
  async resolveShopeeUrl() {
    const list = await deals.listPublished();
    return list.find((d) => d.offers.some((o) => o.platform === "shopee")) ?? null;
  },
};

const stats: StatsRepository = {
  async daily(_workspaceId, days, offsetPeriods = 0) {
    // Kỳ trước: seed khác + hệ số thấp hơn để thấy tăng trưởng (giống mockup)
    const rows = simulateDailyStats(days, days * 7 + 3 + offsetPeriods * 88);
    return offsetPeriods
      ? rows.map((r) => ({ ...r, clicks: Math.round(r.clicks * 0.86), orders: Math.round(r.orders * 0.84), commission: Math.round(r.commission * 0.8) }))
      : rows;
  },
  async breakdowns() {
    return clone(STATS_BREAKDOWNS);
  },
};

const users: UserRepository = {
  async findById(userId) {
    const user = memoryDb().users.find((u) => u.id === userId);
    return user ? clone(user) : null;
  },
  async verifyCredentials(email, password) {
    const db = memoryDb();
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return null;
    const hash = db.passwords.get(user.id);
    const valid = hash ? verifyPassword(password, hash) : password === DEMO_PASSWORD;
    return valid ? clone(user) : null;
  },
  async verifySecondFactor(_userId, code) {
    // Bản mock: chấp nhận mọi mã 6 số. Bản thật phải kiểm TOTP theo secret của user.
    return /^\d{6}$/.test(code);
  },
  async findByEmail(email) {
    const user = memoryDb().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return user ? clone(user) : null;
  },
  async create(user, password) {
    const db = memoryDb();
    db.users.push(clone(user));
    db.passwords.set(user.id, hashPassword(password));
  },
};

/* Băm mật khẩu bằng scrypt (có salt) – không bao giờ lưu mật khẩu gốc */
function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 32).toString("hex")}`;
}

function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  const actual = scryptSync(password, salt, 32);
  return timingSafeEqual(actual, Buffer.from(hash, "hex"));
}

const customers: CustomerRepository = {
  async list() {
    return clone(memoryDb().customers);
  },
  async findById(customerId) {
    const c = memoryDb().customers.find((x) => x.id === customerId);
    return c ? clone(c) : null;
  },
  async findByUserId(userId) {
    const c = memoryDb().customers.find((x) => x.userId === userId);
    return c ? clone(c) : null;
  },
  async update(customerId, patch) {
    const c = mustFind(memoryDb().customers.find((x) => x.id === customerId), `Khách hàng ${customerId}`);
    Object.assign(c, clone(patch));
    // Giữ đồng bộ gói của workspace với gói của khách
    if (patch.planId) workspaceData(c.workspaceId).workspace.planId = patch.planId;
    return clone(c);
  },
  async create(customer) {
    memoryDb().customers.unshift(clone(customer));
  },
};

const plans: PlanRepository = {
  async list() {
    return clone(memoryDb().plans);
  },
  async findById(planId) {
    const p = memoryDb().plans.find((x) => x.id === planId);
    return p ? clone(p) : null;
  },
  async update(planId, patch) {
    const p = mustFind(memoryDb().plans.find((x) => x.id === planId), `Gói ${planId}`);
    Object.assign(p, patch);
    return clone(p);
  },
};

const invoices: InvoiceRepository = {
  async list(filter) {
    return clone(
      memoryDb().invoices.filter(
        (i) => (!filter?.customerId || i.customerId === filter.customerId) && (!filter?.status || i.status === filter.status),
      ),
    );
  },
  async update(number, patch) {
    const inv = mustFind(memoryDb().invoices.find((i) => i.number === number), `Hóa đơn ${number}`);
    Object.assign(inv, patch);
    return clone(inv);
  },
};

const tickets: TicketRepository = {
  async list(filter) {
    return clone(memoryDb().tickets.filter((t) => !filter?.customerId || t.customerId === filter.customerId));
  },
  async findById(ticketId) {
    const t = memoryDb().tickets.find((x) => x.id === ticketId);
    return t ? clone(t) : null;
  },
  async update(ticketId, patch) {
    const t = mustFind(memoryDb().tickets.find((x) => x.id === ticketId), `Yêu cầu ${ticketId}`);
    Object.assign(t, patch);
    return clone(t);
  },
  async addMessage(ticketId, message) {
    const t = mustFind(memoryDb().tickets.find((x) => x.id === ticketId), `Yêu cầu ${ticketId}`);
    t.messages.push(clone(message));
    return clone(t);
  },
};

const audit: AuditRepository = {
  async list(filter) {
    return clone(memoryDb().audit.filter((a) => !filter?.kind || a.kind === filter.kind));
  },
  async append(entry) {
    memoryDb().audit.unshift({ id: crypto.randomUUID(), ...entry });
  },
};

const platform: PlatformSettingsRepository = {
  async get() {
    return clone(memoryDb().platform);
  },
  async update(patch) {
    Object.assign(memoryDb().platform, patch);
    return clone(memoryDb().platform);
  },
};

export const memoryRepositories: Repositories = {
  comparisons,
  stats,
  deals,
  queue,
  workspaces,
  accounts,
  matches,
  links,
  users,
  customers,
  plans,
  invoices,
  tickets,
  audit,
  platform,
};
