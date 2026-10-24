"use client";

import { useActionState } from "react";
import { Button } from "@/shared/ui/button";
import { Banner } from "@/shared/ui/banner";
import { Field, Input } from "@/shared/ui/field";
import { cancelTwoFactorAction, verifyTwoFactorAction } from "../actions";

export function TwoFactorForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(verifyTwoFactorAction, null);
  const errors = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <div className="flex flex-col gap-1">
      <form action={formAction} noValidate className="flex flex-col gap-1">
        <h1 className="text-[22px] tracking-[-0.02em]">Xác minh 2 lớp</h1>
        <p className="mb-3 text-muted">Nhập mã 6 số trong ứng dụng xác thực của bạn.</p>
        {state && !state.ok && !errors && <Banner>{state.error}</Banner>}
        {next && <input type="hidden" name="next" value={next} />}
        <Field label="Mã xác minh" error={errors?.code}>
          <Input
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            autoFocus
            className="text-lg tracking-[0.3em]"
            aria-invalid={!!errors?.code}
          />
        </Field>
        <Button type="submit" variant="primary" className="w-full" disabled={pending}>
          {pending ? "Đang xác minh…" : "Xác minh"}
        </Button>
      </form>
      <form action={cancelTwoFactorAction} className="mt-2">
        <Button type="submit" className="w-full">
          Quay lại
        </Button>
      </form>
    </div>
  );
}
