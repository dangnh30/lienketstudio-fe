import "server-only";
import type { ConnectedAccounts } from "@/domain/accounts";
import type { ProductMatch, ShortLink } from "@/domain/catalog";
import type { Deal } from "@/domain/deal";
import type { Plan } from "@/domain/plan";
import type { AuditEntry, Customer, Invoice, PlatformSettings, Ticket } from "@/domain/platform-admin";
import type { QueueItem } from "@/domain/publishing";
import type { User } from "@/domain/user";
import type { Notification, Workspace } from "@/domain/workspace";
import {
  DEMO_WORKSPACE_ID,
  seedAccounts,
  seedDeals,
  seedLinks,
  seedMatches,
  seedNotifications,
  seedQueue,
  seedUsers,
  seedWorkspace,
} from "./seed";
import { seedAudit, seedCustomers, seedInvoices, seedPlans, seedPlatformSettings, seedTickets } from "./seed-platform";

export type WorkspaceData = {
  workspace: Workspace;
  deals: Deal[];
  queue: QueueItem[];
  notifications: Notification[];
  accounts: ConnectedAccounts;
  matches: ProductMatch[];
  links: ShortLink[];
};

export type MemoryDb = {
  users: User[];
  /** userId → mật khẩu đã băm (scrypt) của tài khoản tự đăng ký; tài khoản mẫu dùng mật khẩu demo */
  passwords: Map<string, string>;
  workspaces: Map<string, WorkspaceData>;
  customers: Customer[];
  plans: Plan[];
  invoices: Invoice[];
  tickets: Ticket[];
  audit: AuditEntry[];
  platform: PlatformSettings;
};

/** Workspace mới đăng ký: chưa có dữ liệu, chưa kết nối tài khoản nào */
export function emptyWorkspaceData(workspace: Workspace): WorkspaceData {
  return {
    workspace,
    deals: [],
    queue: [],
    notifications: [
      { id: crypto.randomUUID(), time: "vừa xong", text: "Chào mừng! Kết nối Shopee hoặc AccessTrade để bắt đầu theo dõi giá", read: false, href: "/app/accounts" },
    ],
    accounts: { meta: { connected: false }, tiktok: { connected: false }, tiktokShop: { connected: false }, shopee: { connected: false }, accessTrade: { connected: false } },
    matches: [],
    links: [],
  };
}

function seedWorkspaceData(workspace: Workspace): WorkspaceData {
  return {
    workspace,
    deals: seedDeals(),
    queue: seedQueue(),
    notifications: seedNotifications(),
    accounts: seedAccounts(),
    matches: seedMatches(),
    links: seedLinks(),
  };
}

function createDb(): MemoryDb {
  const customers = seedCustomers();
  // Mỗi khách hàng có một workspace riêng (bản mock dùng chung bộ dữ liệu deal mẫu)
  const workspaces = new Map(
    customers.map((c) => [c.workspaceId, seedWorkspaceData(seedWorkspace(c.workspaceId, c.workspaceName, c.planId))]),
  );
  if (!workspaces.has(DEMO_WORKSPACE_ID)) workspaces.set(DEMO_WORKSPACE_ID, seedWorkspaceData(seedWorkspace()));

  return {
    users: seedUsers(),
    passwords: new Map(),
    workspaces,
    customers,
    plans: seedPlans(),
    invoices: seedInvoices(),
    tickets: seedTickets(),
    audit: seedAudit(),
    platform: seedPlatformSettings(),
  };
}

// Singleton trên globalThis để không mất dữ liệu khi HMR reload module trong dev.
const globalForDb = globalThis as unknown as { __lienketMemoryDb?: MemoryDb };

export function memoryDb(): MemoryDb {
  globalForDb.__lienketMemoryDb ??= createDb();
  return globalForDb.__lienketMemoryDb;
}
