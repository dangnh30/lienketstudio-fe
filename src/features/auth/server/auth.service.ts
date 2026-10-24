import "server-only";
import type { User } from "@/domain/user";
import { newWorkspace } from "@/domain/workspace";
import { DomainError } from "@/shared/lib/action-result";
import { repositories } from "@/server/container";
import type { Repositories } from "@/server/repositories/types";

/** Quy tắc đăng nhập: mật khẩu, tài khoản bị khóa, chế độ bảo trì */
export class AuthService {
  constructor(private readonly repos: Repositories) {}

  async authenticate(email: string, password: string): Promise<User> {
    const user = await this.repos.users.verifyCredentials(email, password);
    if (!user) throw new DomainError("Email hoặc mật khẩu không đúng");
    if (user.role === "admin") return user;

    const [customer, platform] = await Promise.all([this.repos.customers.findByUserId(user.id), this.repos.platform.get()]);
    if (platform.maintenance) throw new DomainError("Hệ thống đang bảo trì, vui lòng quay lại sau.");
    if (customer?.status === "locked") throw new DomainError("Tài khoản đã bị khóa. Liên hệ hỗ trợ để được mở lại.");
    return user;
  }

  /** Đăng ký: dùng thử gói Chuyên nghiệp theo số ngày trong cài đặt nền tảng, không cần thẻ */
  async signup(input: { name: string; email: string; password: string; workspaceName: string }) {
    const platform = await this.repos.platform.get();
    if (!platform.signupEnabled) throw new DomainError("Tạm ngừng nhận đăng ký mới. Vui lòng quay lại sau.");
    if (await this.repos.users.findByEmail(input.email)) {
      throw new DomainError("Email này đã có tài khoản. Đăng nhập thay vì đăng ký.", { email: "Email này đã có tài khoản. Đăng nhập thay vì đăng ký." });
    }

    const id = crypto.randomUUID().slice(0, 8);
    const user: User = { id: `u_${id}`, name: input.name, email: input.email, role: "customer", workspaceId: `ws_${id}` };
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + platform.trialDays);
    const vnDate = (d: Date) => d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" });

    await this.repos.users.create(user, input.password);
    await this.repos.workspaces.create(newWorkspace({ id: user.workspaceId!, name: input.workspaceName, planId: "pro", owner: input }));
    await this.repos.customers.create({
      id: `c_${id}`,
      userId: user.id,
      workspaceId: user.workspaceId!,
      name: input.name,
      email: input.email,
      phone: "",
      workspaceName: input.workspaceName,
      planId: "pro",
      status: "trial",
      joinedAt: vnDate(new Date()),
      lastActive: "vừa xong",
      trialEndsAt: vnDate(trialEnd),
      linked: { facebook: false, tiktok: false, shopee: false },
      usage: { products: 0, pages: 0, links: 0, members: 1 },
    });
    return { user, trialDays: platform.trialDays, verifyEmail: platform.requireEmailVerification };
  }

  /** Admin luôn phải qua 2FA khi nền tảng bật yêu cầu này */
  async requiresSecondFactor(user: User) {
    if (user.role !== "admin") return false;
    return (await this.repos.platform.get()).requireAdmin2fa;
  }
}

export const authService = () => new AuthService(repositories());
