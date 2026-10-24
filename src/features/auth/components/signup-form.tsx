"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/shared/ui/button";
import { Banner } from "@/shared/ui/banner";
import { Field, Input } from "@/shared/ui/field";
import { signupAction } from "../actions";

export function SignupForm({ trialDays, signupEnabled }: { trialDays: number; signupEnabled: boolean }) {
  const [state, formAction, pending] = useActionState(signupAction, null);
  const errors = state && !state.ok ? (state.fieldErrors ?? {}) : {};
  const formError = state && !state.ok && !state.fieldErrors ? state.error : undefined;

  return (
    <form action={formAction} noValidate className="flex flex-col gap-1">
      <h1 className="text-[22px] tracking-[-0.02em]">Tạo tài khoản</h1>
      <p className="mb-3 text-muted">Dùng thử {trialDays} ngày gói Chuyên nghiệp, không cần nhập thẻ.</p>

      {!signupEnabled && (
        <Banner>
          <b>Tạm ngừng nhận đăng ký mới.</b> Vui lòng quay lại sau.
        </Banner>
      )}
      {formError && <Banner>{formError}</Banner>}

      <Field label="Họ và tên" error={errors.name} className="mt-2">
        <Input name="name" autoComplete="name" aria-invalid={!!errors.name} />
      </Field>
      <Field label="Email" error={errors.email}>
        <Input type="email" name="email" autoComplete="email" aria-invalid={!!errors.email} />
      </Field>
      <Field label="Mật khẩu" hint="Ít nhất 8 ký tự" error={errors.password}>
        <Input type="password" name="password" autoComplete="new-password" aria-invalid={!!errors.password} />
      </Field>
      <Field label="Tên kênh hoặc workspace" error={errors.workspaceName}>
        <Input name="workspaceName" placeholder="Ví dụ: Săn deal tai nghe" aria-invalid={!!errors.workspaceName} />
      </Field>

      <label className="flex cursor-pointer items-start gap-2.5 text-[13.5px]">
        <input type="checkbox" name="terms" className="mt-[3px]" aria-invalid={!!errors.terms} />
        <span>
          Tôi đồng ý với{" "}
          <Link href="/dieu-khoan" target="_blank">
            Điều khoản sử dụng
          </Link>{" "}
          và{" "}
          <Link href="/bao-mat" target="_blank">
            Chính sách bảo mật
          </Link>
        </span>
      </label>
      <span className="min-h-[18px] text-[13px] font-medium text-danger" aria-live="polite">
        {errors.terms}
      </span>

      <Button type="submit" variant="primary" className="w-full" disabled={pending || !signupEnabled}>
        {pending ? "Đang tạo tài khoản…" : "Tạo tài khoản"}
      </Button>

      <div className="my-3 flex items-center gap-2.5 text-[12.5px] text-muted before:flex-1 before:border-t before:border-line after:flex-1 after:border-t after:border-line">
        hoặc
      </div>
      <Button className="w-full" disabled title="Cần cấu hình Google OAuth">
        Đăng ký bằng tài khoản Google
      </Button>

      <p className="mt-3 text-center text-[13px] text-muted">
        Đã có tài khoản?{" "}
        <Link href="/login" className="font-medium">
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}
