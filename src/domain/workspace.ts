export type DealFilterSettings = {
  /** Giảm tối thiểu so với TB 30 ngày (%) */
  minDrop: number;
  minScore: number;
  /** Gắn cờ giảm ảo khi giá tăng quá (%) trong 14 ngày */
  fakeRise: number;
  minCommission: number;
  capFbPagePerDay: number;
  capFbGroupPerDay: number;
  disclosure: string;
  verifyBeforePost: boolean;
  manualReview: boolean;
  aiNoClaims: boolean;
};

export type GeneralSettings = {
  timezone: "Asia/Ho_Chi_Minh";
  currency: "VND";
  /** Không đăng bài / không gửi thông báo đẩy trong khung giờ này ("HH:mm") */
  quietFrom: string;
  quietTo: string;
};

export type ScanSettings = {
  /** Phút một lần */
  hotMinutes: number;
  tiktokMinutes: number;
  normalMinutes: number;
  /** Giờ tải datafeed tìm sản phẩm mới ("HH:mm") */
  feedAt: string;
  accessTradeRatePerMinute: number;
  retries: number;
  verifyMinutesBeforePost: number;
};

export type NotifySettings = {
  push: boolean;
  email: boolean;
  newDeal: boolean;
  readyToPost: boolean;
  fakeDeal: boolean;
  apiError: boolean;
  tokenExpiry: boolean;
  dailyDigest: boolean;
  digestAt: string;
};

export type MemberRole = "owner" | "editor" | "viewer";

export const MEMBER_ROLES: Record<MemberRole, { label: string; description: string }> = {
  owner: { label: "Chủ hệ thống", description: "Toàn quyền, kể cả khóa API và người dùng" },
  editor: { label: "Biên tập", description: "Duyệt deal, đăng bài, sửa bộ lọc" },
  viewer: { label: "Chỉ xem", description: "Xem tổng quan và hiệu quả" },
};

export type Member = { id: string; name: string; email: string; role: MemberRole };

export type Niche = { name: string; enabled: boolean };

export type Notification = {
  id: string;
  time: string;
  text: string;
  href: string;
  read: boolean;
};

export type Workspace = {
  id: string;
  name: string;
  planId: string;
  niches: Niche[];
  settings: DealFilterSettings;
  general: GeneralSettings;
  scan: ScanSettings;
  notify: NotifySettings;
  members: Member[];
  postedFbPageToday: number;
  paused: boolean;
  /** Đã yêu cầu xóa workspace: dữ liệu bị xóa sau 30 ngày, trong thời gian đó khôi phục được */
  deletionRequestedAt?: string | null;
};

export const WORKSPACE_DELETION_GRACE_DAYS = 30;

/** Các nhóm cài đặt sửa được qua màn Cài đặt */
export type WorkspacePatch = Partial<
  Pick<Workspace, "name" | "niches" | "settings" | "general" | "scan" | "notify" | "paused" | "planId" | "members" | "deletionRequestedAt">
>;

/** Workspace mặc định cho tài khoản vừa đăng ký (cài đặt khuyến nghị cho giai đoạn đầu) */
export function newWorkspace(input: { id: string; name: string; planId: string; owner: { name: string; email: string } }): Workspace {
  return {
    id: input.id,
    name: input.name,
    planId: input.planId,
    niches: [],
    settings: {
      minDrop: 15,
      minScore: 70,
      fakeRise: 20,
      minCommission: 3,
      capFbPagePerDay: 10,
      capFbGroupPerDay: 5,
      disclosure: "Bài có chứa link tiếp thị liên kết. Mình nhận hoa hồng nếu bạn mua qua link, giá bạn trả không đổi.",
      verifyBeforePost: true,
      manualReview: true,
      aiNoClaims: true,
    },
    general: { timezone: "Asia/Ho_Chi_Minh", currency: "VND", quietFrom: "23:00", quietTo: "07:00" },
    scan: { hotMinutes: 5, tiktokMinutes: 30, normalMinutes: 180, feedAt: "02:00", accessTradeRatePerMinute: 18, retries: 3, verifyMinutesBeforePost: 5 },
    notify: { push: true, email: true, newDeal: true, readyToPost: true, fakeDeal: true, apiError: true, tokenExpiry: true, dailyDigest: true, digestAt: "21:30" },
    members: [{ id: crypto.randomUUID(), name: input.owner.name, email: input.owner.email, role: "owner" }],
    postedFbPageToday: 0,
    paused: false,
  };
}
