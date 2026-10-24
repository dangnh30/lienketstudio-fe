import { PLAN_ORDER, PLANS, type Plan } from "@/domain/plan";
import type { AuditEntry, Customer, Invoice, PlatformSettings, Ticket } from "@/domain/platform-admin";
import { slugify } from "@/shared/lib/format";

/* Dữ liệu mẫu khu quản trị nền tảng – chuyển từ design/mockup.html */

export const DEMO_WORKSPACE_ID = "ws_demo";

type CustomerSeed = [
  id: string,
  name: string,
  workspace: string,
  plan: Plan["id"],
  status: Customer["status"],
  joined: string,
  last: string,
  usage: Customer["usage"],
  extra?: Partial<Customer>,
];

const CUSTOMERS: CustomerSeed[] = [
  ["c01", "Nguyễn Minh Anh", "Săn deal tai nghe", "pro", "active", "03/06/2026", "5 phút trước", { products: 2140, pages: 1, links: 312, members: 2 }, { phone: "09xx xxx 128" }],
  ["c02", "Trần Quốc Bảo", "Bảo review đồ bếp", "basic", "active", "14/07/2026", "1 giờ trước", { products: 1630, pages: 1, links: 540, members: 1 }, { linked: { facebook: true, tiktok: false, shopee: true } }],
  ["c03", "Lê Thu Hà", "Hà săn sale mỹ phẩm", "pro", "overdue", "22/05/2026", "3 ngày trước", { products: 4410, pages: 3, links: 2210, members: 3 }],
  ["c04", "Phạm Gia Huy", "Góc công nghệ Huy", "pro", "trial", "16/10/2026", "20 phút trước", { products: 380, pages: 1, links: 22, members: 1 }, { trialEndsAt: "30/10/2026", linked: { facebook: true, tiktok: false, shopee: true } }],
  ["c05", "Hoàng Ngọc Lan", "Mẹ Lan săn deal", "team", "active", "11/03/2026", "2 giờ trước", { products: 12800, pages: 6, links: 9020, members: 7 }],
  ["c06", "Võ Thành Đạt", "Đạt deal thể thao", "free", "active", "02/09/2026", "hôm qua", { products: 290, pages: 1, links: 61, members: 1 }, { linked: { facebook: true, tiktok: false, shopee: false } }],
  ["c07", "Đặng Mai Phương", "Phương decor", "basic", "locked", "09/04/2026", "12 ngày trước", { products: 0, pages: 0, links: 0, members: 1 }, { linked: { facebook: false, tiktok: false, shopee: true }, lockReason: "Đăng link chuyển hướng sai sản phẩm, bị Shopee cảnh báo", previousStatus: "active" }],
  ["c08", "Bùi Anh Khoa", "Khoa săn deal laptop", "pro", "trial", "19/10/2026", "vừa xong", { products: 120, pages: 1, links: 4, members: 1 }, { trialEndsAt: "02/11/2026", linked: { facebook: true, tiktok: true, shopee: false } }],
  ["c09", "Đỗ Hải Yến", "Yến review sách", "basic", "active", "28/08/2026", "4 giờ trước", { products: 910, pages: 1, links: 388, members: 1 }, { linked: { facebook: true, tiktok: false, shopee: true } }],
  ["c10", "Ngô Tuấn Kiệt", "Kiệt đồ chơi xe", "basic", "overdue", "05/05/2026", "6 ngày trước", { products: 1750, pages: 1, links: 870, members: 2 }],
  ["c11", "Dương Khánh Linh", "Linh thời trang", "pro", "active", "17/02/2026", "30 phút trước", { products: 3920, pages: 2, links: 3310, members: 4 }],
  ["c12", "Lý Hoàng Nam", "Nam phụ kiện điện thoại", "free", "trial", "21/10/2026", "1 giờ trước", { products: 40, pages: 0, links: 0, members: 1 }, { trialEndsAt: "04/11/2026", linked: { facebook: false, tiktok: false, shopee: true } }],
];

const customerEmail = (id: string, name: string) =>
  id === "c01" ? "minhanh@example.com" : `${slugify(name.split(" ").pop() ?? name)}${id.slice(1)}@example.com`;

export function seedCustomers(): Customer[] {
  return CUSTOMERS.map(([id, name, workspaceName, planId, status, joinedAt, lastActive, usage, extra]) => ({
    id,
    userId: `u_${id}`,
    workspaceId: id === "c01" ? DEMO_WORKSPACE_ID : `ws_${id}`,
    name,
    email: customerEmail(id, name),
    phone: "09xx xxx xxx",
    workspaceName,
    planId,
    status,
    joinedAt,
    lastActive,
    usage,
    linked: { facebook: true, tiktok: true, shopee: true },
    ...extra,
  }));
}

export function seedInvoices(): Invoice[] {
  const i = (number: string, customerId: string, planId: Plan["id"], amount: number, date: string, method: Invoice["method"], status: Invoice["status"]): Invoice => ({
    number, customerId, planId, amount, date, method, status,
  });
  return [
    i("HD-2610-0412", "c05", "team", 699000, "22/10/2026", "VietQR", "paid"),
    i("HD-2610-0411", "c11", "pro", 299000, "22/10/2026", "MoMo", "paid"),
    i("HD-2610-0409", "c03", "pro", 299000, "19/10/2026", "VNPay", "failed"),
    i("HD-2610-0405", "c10", "basic", 149000, "16/10/2026", "VietQR", "pending"),
    i("HD-2610-0398", "c02", "basic", 149000, "14/10/2026", "MoMo", "paid"),
    i("HD-2610-0390", "c09", "basic", 149000, "28/09/2026", "VietQR", "paid"),
    i("HD-2609-0371", "c01", "pro", 299000, "03/10/2026", "VietQR", "paid"),
    i("HD-2609-0322", "c01", "pro", 299000, "03/09/2026", "VietQR", "paid"),
    i("HD-2608-0277", "c01", "basic", 149000, "03/08/2026", "MoMo", "paid"),
  ];
}

export function seedTickets(): Ticket[] {
  return [
    {
      id: "t1", customerId: "c03", title: "Không đăng được lên Page sau khi đổi mật khẩu Facebook", status: "open", priority: "Cao", at: "10:12",
      messages: [{ from: "customer", at: "10:12", text: "Từ sáng nay bài lên lịch không đăng được, mình vừa đổi mật khẩu Facebook hôm qua." }],
    },
    {
      id: "t2", customerId: "c04", title: "Gói dùng thử có tự trừ tiền khi hết hạn không?", status: "open", priority: "Thường", at: "09:40",
      messages: [{ from: "customer", at: "09:40", text: "Hết 14 ngày dùng thử thì có tự gia hạn không ạ? Mình chưa nhập thẻ." }],
    },
    {
      id: "t3", customerId: "c10", title: "Chuyển khoản rồi nhưng tài khoản vẫn báo quá hạn", status: "pending", priority: "Cao", at: "hôm qua",
      messages: [
        { from: "customer", at: "hôm qua 20:05", text: "Mình đã chuyển khoản 149.000đ lúc 19:50, nội dung HD-2610-0405." },
        { from: "support", at: "hôm qua 20:30", text: "Bộ phận kế toán đang đối soát, sẽ cập nhật trong sáng nay." },
      ],
    },
    {
      id: "t4", customerId: "c02", title: "Muốn thêm ngách thứ hai", status: "closed", priority: "Thấp", at: "20/10",
      messages: [
        { from: "customer", at: "20/10", text: "Gói Cơ bản có thêm ngách được không?" },
        { from: "support", at: "20/10", text: "Gói Cơ bản có 1 ngách, nâng lên Chuyên nghiệp để có 3 ngách nhé." },
      ],
    },
  ];
}

export function seedAudit(): AuditEntry[] {
  const a = (id: string, at: string, actor: string, action: string, target: string, ip: string, kind: AuditEntry["kind"]): AuditEntry => ({
    id, at, actor, action, target, ip, kind,
  });
  return [
    a("a1", "22/10 10:05", "[Quản trị viên]", "Đăng nhập, xác minh 2 lớp thành công", "—", "113.161.x.x", "security"),
    a("a2", "21/10 17:20", "[Quản trị viên]", "Khóa tài khoản", "Đặng Mai Phương", "113.161.x.x", "admin"),
    a("a3", "21/10 16:02", "Hệ thống", "Thanh toán thất bại, thẻ bị từ chối", "HD-2610-0409", "—", "billing"),
    a("a4", "21/10 09:15", "[Quản trị viên]", "Sửa giới hạn gói Chuyên nghiệp: 4.000 → 5.000 sản phẩm", "Gói Chuyên nghiệp", "113.161.x.x", "admin"),
    a("a5", "20/10 22:41", "Hệ thống", "Chặn đăng nhập sai mật khẩu 5 lần liên tiếp", "kiet10@example.com", "27.72.x.x", "security"),
    a("a6", "20/10 14:30", "[Quản trị viên]", "Đăng nhập thay khách hàng để hỗ trợ", "Trần Quốc Bảo", "113.161.x.x", "admin"),
  ];
}

export function seedPlatformSettings(): PlatformSettings {
  return {
    signupEnabled: true,
    trialDays: 14,
    requireEmailVerification: true,
    broadcastEnabled: false,
    broadcast: "Từ 01/11, TikTok Shop thay đổi tỷ lệ hoa hồng một số ngành hàng. Kiểm tra lại bộ lọc hoa hồng tối thiểu.",
    maintenance: false,
    requireAdmin2fa: true,
    adminSessionHours: 8,
  };
}

export function seedPlans(): Plan[] {
  return PLAN_ORDER.map((id) => ({ ...PLANS[id] }));
}
