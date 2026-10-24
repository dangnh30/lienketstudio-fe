"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/shared/ui/button";
import { Banner } from "@/shared/ui/banner";
import { Field, Input } from "@/shared/ui/field";
import { loginAction } from "../actions";

export function LoginForm({ next, notice, trialDays }: { next?: string; notice?: string; trialDays: number }) {
  const [state, formAction, pending] = useActionState(loginAction, null);
  const errors = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <form action={formAction} noValidate className="flex flex-col gap-1">
      <h1 className="text-[22px] tracking-[-0.02em]">Đăng nhập</h1>
      <p className="mb-3 text-muted">Quản lý deal, lịch đăng và hoa hồng affiliate của bạn.</p>

      {notice && <Banner>{notice}</Banner>}
      {state && !state.ok && !errors && <Banner>{state.error}</Banner>}

      {next && <input type="hidden" name="next" value={next} />}
      <Field label="Email" error={errors?.email} className="mt-2">
        <Input type="email" name="email" autoComplete="username" required aria-invalid={!!errors?.email} />
      </Field>
      <Field label="Mật khẩu" error={errors?.password}>
        <Input type="password" name="password" autoComplete="current-password" required aria-invalid={!!errors?.password} />
      </Field>

      <Button type="submit" variant="primary" className="w-full" disabled={pending}>
        {pending ? "Đang đăng nhập…" : "Đăng nhập"}
      </Button>

      <p className="mt-3 text-center text-[13px] text-muted">
        Chưa có tài khoản?{" "}
        <Link href="/signup" className="font-medium">
          Đăng ký, dùng thử {trialDays} ngày miễn phí
        </Link>
      </p>

      <div className="mt-4 flex flex-col gap-1 rounded-sm border border-dashed border-line bg-hover p-3 text-[13px] text-muted">
        <span>Tài khoản dùng thử (mật khẩu <code className="font-semibold text-ink">demo1234</code>):</span>
        <span>
          Khách hàng: <code className="font-semibold text-ink">minhanh@example.com</code>
        </span>
        <span>
          Quản trị viên: <code className="font-semibold text-ink">admin@lienket.vn</code> (mã 2 lớp: 6 số bất kỳ)
        </span>
      </div>
    </form>
  );
}
