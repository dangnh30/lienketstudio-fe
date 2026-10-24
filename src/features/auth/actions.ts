"use server";

import { redirect } from "next/navigation";
import { DomainError, fail, zodFieldErrors, type ActionResult } from "@/shared/lib/action-result";
import { recordAudit } from "@/server/audit";
import { repositories } from "@/server/container";
import { requireAdmin } from "@/server/auth/dal";
import {
  clearPending2fa,
  createPending2fa,
  createSession,
  destroySession,
  readPending2fa,
  readSession,
} from "@/server/auth/session";
import { loginSchema, safeNextPath, signupSchema, twoFactorSchema } from "./schemas";
import { authService } from "./server/auth.service";

export async function loginAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail("Kiểm tra lại thông tin đăng nhập", zodFieldErrors(parsed.error));

  const { email, password, next } = parsed.data;
  const auth = authService();
  let user;
  try {
    user = await auth.authenticate(email, password);
  } catch (error) {
    if (error instanceof DomainError) return fail(error.message);
    throw error;
  }

  if (await auth.requiresSecondFactor(user)) {
    await createPending2fa(user.id);
    redirect(`/login?step=2fa${next ? `&next=${encodeURIComponent(next)}` : ""}`);
  }

  await createSession({ userId: user.id, role: user.role });
  redirect(safeNextPath(next, user.role === "admin" ? "/admin" : "/app"));
}

export async function signupAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail("Kiểm tra lại các ô được đánh dấu", zodFieldErrors(parsed.error));

  let user;
  try {
    ({ user } = await authService().signup(parsed.data));
  } catch (error) {
    if (error instanceof DomainError) return fail(error.message, error.fieldErrors);
    throw error;
  }
  await createSession({ userId: user.id, role: "customer" });
  redirect("/app");
}

export async function verifyTwoFactorAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const pending = await readPending2fa();
  if (!pending) return fail("Phiên xác minh đã hết hạn, đăng nhập lại");

  const parsed = twoFactorSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail("Mã chưa hợp lệ", zodFieldErrors(parsed.error));

  const { users } = repositories();
  const valid = await users.verifySecondFactor(pending.userId, parsed.data.code);
  if (!valid) return fail("Mã xác minh không đúng", { code: "Mã xác minh không đúng" });

  const user = await users.findById(pending.userId);
  if (!user) return fail("Tài khoản không tồn tại");

  await clearPending2fa();
  const { adminSessionHours } = await repositories().platform.get();
  await createSession({ userId: user.id, role: user.role }, adminSessionHours);
  await recordAudit({ actor: user.name, action: "Đăng nhập, xác minh 2 lớp thành công", kind: "security" });
  redirect(safeNextPath(formData.get("next")?.toString(), "/admin"));
}

export async function cancelTwoFactorAction() {
  await clearPending2fa();
  redirect("/login");
}

export async function logoutAction() {
  const session = await readSession();
  if (session?.role === "admin") {
    const admin = await repositories().users.findById(session.userId);
    await recordAudit({ actor: admin?.name ?? "Quản trị viên", action: "Đăng xuất", kind: "security" });
  }
  await destroySession();
  redirect("/");
}

/** Admin thoát chế độ "đăng nhập thay" và quay về trang chi tiết khách hàng */
export async function exitImpersonationAction() {
  const admin = await requireAdmin();
  const session = await readSession();
  const customer = session?.impersonating ? await repositories().customers.findByUserId(session.impersonating) : null;
  await createSession({ userId: admin.id, role: "admin" });
  redirect(customer ? `/admin/customers/${customer.id}` : "/admin/customers");
}
