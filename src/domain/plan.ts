export type Plan = {
  id: "free" | "basic" | "pro" | "team";
  name: string;
  /** VND / tháng */
  price: number;
  niches: number;
  products: number;
  fbPostsPerDay: number;
  pages: number;
  links: number;
  members: number;
  autoApprove: boolean;
  /** Hiện trên trang bảng giá / cho khách tự chọn */
  visible: boolean;
};

export const PLAN_ORDER: Plan["id"][] = ["free", "basic", "pro", "team"];

export const PLANS: Record<Plan["id"], Plan> = {
  free: { id: "free", name: "Miễn phí", price: 0, niches: 1, products: 300, fbPostsPerDay: 3, pages: 1, links: 100, members: 1, autoApprove: false, visible: true },
  basic: { id: "basic", name: "Cơ bản", price: 149000, niches: 1, products: 2000, fbPostsPerDay: 10, pages: 1, links: 1000, members: 2, autoApprove: true, visible: true },
  pro: { id: "pro", name: "Chuyên nghiệp", price: 299000, niches: 3, products: 5000, fbPostsPerDay: 20, pages: 3, links: 5000, members: 5, autoApprove: true, visible: true },
  team: { id: "team", name: "Đội nhóm", price: 699000, niches: 10, products: 20000, fbPostsPerDay: 50, pages: 10, links: 20000, members: 15, autoApprove: true, visible: true },
};

export function planName(planId: string) {
  return PLANS[planId as Plan["id"]]?.name ?? planId;
}
