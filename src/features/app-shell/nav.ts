import type { LucideIcon } from "lucide-react";
import {
  ChartColumn,
  CreditCard,
  FileText,
  House,
  Inbox,
  Calendar,
  Layers,
  Link2,
  MousePointerClick,
  Plug,
  Server,
  Settings,
  UserCheck,
  Users,
  CircleQuestionMark,
} from "lucide-react";

export type NavCountKey = "review" | "schedule" | "matching" | "accounts" | "customers" | "billing" | "support";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  countKey?: NavCountKey;
  /** true: chỉ active khi khớp chính xác (dùng cho trang tổng quan) */
  exact?: boolean;
};

export type NavGroup = { label: string; items: NavItem[] };

export const CUSTOMER_NAV: NavGroup[] = [
  {
    label: "Vận hành",
    items: [
      { href: "/app", label: "Tổng quan", icon: House, exact: true },
      { href: "/app/review", label: "Duyệt deal", icon: Inbox, countKey: "review" },
      { href: "/app/schedule", label: "Lịch đăng", icon: Calendar, countKey: "schedule" },
      { href: "/app/matching", label: "Ghép sản phẩm", icon: Link2, countKey: "matching" },
    ],
  },
  {
    label: "Phân tích",
    items: [
      { href: "/app/performance", label: "Thống kê", icon: ChartColumn },
      { href: "/app/links", label: "Liên kết", icon: MousePointerClick },
    ],
  },
  {
    label: "Hệ thống",
    items: [
      { href: "/app/accounts", label: "Tài khoản liên kết", icon: UserCheck, countKey: "accounts" },
      { href: "/app/sources", label: "Kết nối và nguồn", icon: Plug },
      { href: "/app/settings", label: "Cài đặt", icon: Settings },
    ],
  },
];

export const ADMIN_NAV: NavGroup[] = [
  {
    label: "Nền tảng",
    items: [
      { href: "/admin", label: "Tổng quan", icon: House, exact: true },
      { href: "/admin/customers", label: "Khách hàng", icon: Users, countKey: "customers" },
      { href: "/admin/plans", label: "Gói cước", icon: Layers },
      { href: "/admin/billing", label: "Thanh toán", icon: CreditCard, countKey: "billing" },
      { href: "/admin/support", label: "Hỗ trợ", icon: CircleQuestionMark, countKey: "support" },
    ],
  },
  {
    label: "Vận hành",
    items: [
      { href: "/admin/system", label: "Tình trạng hệ thống", icon: Server },
      { href: "/admin/audit", label: "Nhật ký", icon: FileText },
    ],
  },
  {
    label: "Cấu hình",
    items: [{ href: "/admin/settings", label: "Cài đặt nền tảng", icon: Settings }],
  },
];

/** Tìm mục menu đang active theo pathname (khớp tiền tố dài nhất) */
export function findActiveItem(groups: NavGroup[], pathname: string): NavItem | undefined {
  return groups
    .flatMap((g) => g.items)
    .filter((item) => (item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`)))
    .sort((a, b) => b.href.length - a.href.length)[0];
}
