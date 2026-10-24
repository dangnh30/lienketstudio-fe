/** Tài khoản bên ngoài mà workspace kết nối để đăng bài và lấy dữ liệu */

export type FacebookPage = { id: string; name: string; followers: string; autoPost: boolean };
export type FacebookGroup = { id: string; name: string; members: string };

export type ConnectedAccounts = {
  meta:
    | { connected: false }
    | {
        connected: true;
        user: string;
        /** Số ngày còn lại của quyền truy cập */
        expiresInDays: number;
        scopes: string[];
        pages: FacebookPage[];
        groups: FacebookGroup[];
      };
  tiktok: { connected: false } | { connected: true; user: string; followers: string; scopes: string[]; canUpload: boolean };
  tiktokShop: { connected: boolean };
  shopee: { connected: false } | { connected: true; user: string; affiliateId: string };
  accessTrade: { connected: false } | { connected: true; publisher: string; campaigns: string[] };
};

export type AccountKey = keyof ConnectedAccounts;

export const ACCOUNT_LABEL: Record<AccountKey, string> = {
  meta: "Facebook",
  tiktok: "TikTok",
  tiktokShop: "TikTok Shop Affiliate",
  shopee: "Shopee Affiliate",
  accessTrade: "AccessTrade",
};

export const TOKEN_WARNING_DAYS = 14;

/** Số tài khoản cần chú ý (chưa kết nối hoặc quyền sắp hết hạn) – dùng cho bộ đếm menu */
export function accountAlerts(accounts: ConnectedAccounts): number {
  const disconnected = (Object.keys(accounts) as AccountKey[]).filter((k) => !accounts[k].connected).length;
  const expiring = accounts.meta.connected && accounts.meta.expiresInDays <= TOKEN_WARNING_DAYS ? 1 : 0;
  return disconnected + expiring;
}

/** subId gắn vào link affiliate để tách đơn theo kênh */
export const TRACKING_SUB_IDS = [
  { channel: "Facebook Page", tone: "fb", subId: "lk_fbpage" },
  { channel: "Facebook Group", tone: "fb", subId: "lk_fbgroup" },
  { channel: "TikTok", tone: "tiktok", subId: "lk_tiktok" },
  { channel: "Trang so sánh giá", tone: "neutral", subId: "lk_site" },
] as const;
