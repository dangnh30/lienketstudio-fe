import type { ConnectedAccounts } from "@/domain/accounts";
import type { MatchStatus, ProductMatch, ShortLink } from "@/domain/catalog";
import type { Comparison } from "@/domain/comparison";
import type { Deal, DealStatus } from "@/domain/deal";
import type { Plan } from "@/domain/plan";
import type { Channel } from "@/domain/platform";
import type {
  AuditEntry,
  AuditKind,
  Customer,
  Invoice,
  InvoiceStatus,
  PlatformSettings,
  Ticket,
  TicketMessage,
} from "@/domain/platform-admin";
import type { QueueItem } from "@/domain/publishing";
import type { User } from "@/domain/user";
import type { Notification, Workspace, WorkspacePatch } from "@/domain/workspace";

/*
 * Hợp đồng truy cập dữ liệu. UI và service chỉ phụ thuộc vào các interface này,
 * nên thay nguồn dữ liệu (mock → REST API / DB) chỉ cần viết implementation mới
 * và đổi trong server/container.ts.
 */

/* ---------- Dữ liệu của một workspace (khách hàng) ---------- */

export interface DealRepository {
  listByWorkspace(workspaceId: string, filter?: { status?: DealStatus }): Promise<Deal[]>;
  findById(workspaceId: string, dealId: string): Promise<Deal | null>;
  update(workspaceId: string, dealId: string, patch: Partial<Pick<Deal, "status" | "channels">>): Promise<Deal>;
  /** Deal đã duyệt, hiển thị trên trang so sánh giá công khai */
  listPublished(): Promise<Deal[]>;
  findPublishedBySlug(slug: string): Promise<Deal | null>;
}

export interface QueueRepository {
  listByWorkspace(workspaceId: string, channel?: Channel): Promise<QueueItem[]>;
  addMany(workspaceId: string, items: QueueItem[]): Promise<void>;
  update(workspaceId: string, itemId: string, patch: Partial<Pick<QueueItem, "status" | "time">>): Promise<QueueItem>;
  remove(workspaceId: string, itemId: string): Promise<void>;
}

export interface WorkspaceRepository {
  findById(workspaceId: string): Promise<Workspace | null>;
  /** Tạo workspace trống (chưa có sản phẩm, chưa kết nối tài khoản nào) */
  create(workspace: Workspace): Promise<void>;
  update(workspaceId: string, patch: WorkspacePatch): Promise<Workspace>;
  listNotifications(workspaceId: string): Promise<Notification[]>;
  addNotification(workspaceId: string, notification: Omit<Notification, "id">): Promise<void>;
  markNotificationsRead(workspaceId: string, ids?: string[]): Promise<void>;
}

export interface AccountRepository {
  get(workspaceId: string): Promise<ConnectedAccounts>;
  save(workspaceId: string, accounts: ConnectedAccounts): Promise<void>;
}

export interface MatchRepository {
  listByWorkspace(workspaceId: string): Promise<ProductMatch[]>;
  setStatus(workspaceId: string, matchId: string, status: MatchStatus): Promise<ProductMatch>;
}

export interface LinkRepository {
  listByWorkspace(workspaceId: string): Promise<ShortLink[]>;
  setEnabled(workspaceId: string, code: string, enabled: boolean): Promise<ShortLink>;
}

export interface ComparisonRepository {
  /** Kết quả tìm cùng sản phẩm trên sàn còn lại và các website bán lẻ khác */
  forDeal(deal: Deal): Promise<Comparison>;
  /** Đọc link Shopee (shopee.vn/…, shp.ee/…) → sản phẩm đang theo dõi tương ứng */
  resolveShopeeUrl(url: string): Promise<Deal | null>;
}

export type DailyStat = { date: string; clicks: number; orders: number; commission: number };

/** Tỷ lệ phân bổ (tổng các share trong một nhóm ≈ 1) */
export type Share = { key: string; label: string; share: number };

export type StatsBreakdowns = {
  /** Hoa hồng theo sàn; avgCommission = % hoa hồng trung bình */
  platforms: { key: "shopee" | "tiktokshop"; label: string; commissionShare: number; orderShare: number; avgCommission: number }[];
  /** Đơn theo khung giờ (trọng số tương đối) */
  hours: { label: string; weight: number }[];
  /** Sản phẩm mang lại hoa hồng nhiều nhất: share lượt bấm / đơn / hoa hồng */
  topProducts: { dealId: string; clickShare: number; orderShare: number; commissionShare: number }[];
  /** Kênh đăng: số bài mỗi ngày (null = không đăng bài) và share hoa hồng */
  channels: { key: string; label: string; postsPerDay: number | null; commissionShare: number; note: string }[];
  clickSources: Share[];
  devices: Share[];
  regions: Share[];
  /** Lượt mở link bị lọc (bot, xem trước, bấm lặp) */
  filteredClicks: { label: string; detail: string; share: number }[];
  /** Phễu lọc deal trên mỗi 30 ngày */
  funnelPer30Days: { tracked: number; steps: { key: string; value: number }[] };
};

export interface StatsRepository {
  /** Số liệu theo ngày, từ cũ đến mới, kết thúc ở hôm nay; offsetPeriods=1 là kỳ liền trước */
  daily(workspaceId: string, days: number, offsetPeriods?: number): Promise<DailyStat[]>;
  breakdowns(workspaceId: string): Promise<StatsBreakdowns>;
}

/* ---------- Dữ liệu cấp nền tảng (khu quản trị) ---------- */

export interface UserRepository {
  findById(userId: string): Promise<User | null>;
  /** Trả về user nếu email + mật khẩu đúng */
  verifyCredentials(email: string, password: string): Promise<User | null>;
  /** Kiểm tra mã xác minh 2 lớp (TOTP) */
  verifySecondFactor(userId: string, code: string): Promise<boolean>;
  findByEmail(email: string): Promise<User | null>;
  /** Tạo user mới; mật khẩu được băm trước khi lưu */
  create(user: User, password: string): Promise<void>;
}

export interface CustomerRepository {
  list(): Promise<Customer[]>;
  findById(customerId: string): Promise<Customer | null>;
  findByUserId(userId: string): Promise<Customer | null>;
  update(customerId: string, patch: Partial<Omit<Customer, "id" | "userId" | "workspaceId">>): Promise<Customer>;
  create(customer: Customer): Promise<void>;
}

export interface PlanRepository {
  list(): Promise<Plan[]>;
  findById(planId: Plan["id"]): Promise<Plan | null>;
  update(planId: Plan["id"], patch: Partial<Omit<Plan, "id" | "name">>): Promise<Plan>;
}

export interface InvoiceRepository {
  list(filter?: { customerId?: string; status?: InvoiceStatus }): Promise<Invoice[]>;
  update(number: string, patch: Partial<Pick<Invoice, "status">>): Promise<Invoice>;
}

export interface TicketRepository {
  list(filter?: { customerId?: string }): Promise<Ticket[]>;
  findById(ticketId: string): Promise<Ticket | null>;
  update(ticketId: string, patch: Partial<Pick<Ticket, "status">>): Promise<Ticket>;
  addMessage(ticketId: string, message: TicketMessage): Promise<Ticket>;
}

export interface AuditRepository {
  list(filter?: { kind?: AuditKind }): Promise<AuditEntry[]>;
  append(entry: Omit<AuditEntry, "id">): Promise<void>;
}

export interface PlatformSettingsRepository {
  get(): Promise<PlatformSettings>;
  update(patch: Partial<PlatformSettings>): Promise<PlatformSettings>;
}

export interface Repositories {
  comparisons: ComparisonRepository;
  stats: StatsRepository;
  deals: DealRepository;
  queue: QueueRepository;
  workspaces: WorkspaceRepository;
  accounts: AccountRepository;
  matches: MatchRepository;
  links: LinkRepository;
  users: UserRepository;
  customers: CustomerRepository;
  plans: PlanRepository;
  invoices: InvoiceRepository;
  tickets: TicketRepository;
  audit: AuditRepository;
  platform: PlatformSettingsRepository;
}
