"use client";

import { createContext, use, useActionState, useEffect, useRef, type ComponentProps, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { ActionResult } from "@/shared/lib/action-result";
import { Button } from "./button";
import { Field, Input, Select, Textarea } from "./field";
import { useToast } from "./toast";

type FormAction = (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;

const ErrorsContext = createContext<Record<string, string>>({});

/**
 * Form gắn với server action qua useActionState:
 * - lỗi theo field được đưa xuống <FormInput>/<FormSelect>… qua context
 * - thành công thì báo toast (và reset form nếu resetOnSuccess)
 * - vẫn submit được khi JS chưa tải (progressive enhancement)
 */
export function ActionForm({
  action,
  children,
  className,
  resetOnSuccess = false,
}: {
  action: FormAction;
  children: ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
}) {
  const [state, formAction] = useActionState(action, null);
  const toast = useToast();
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast(state.message ?? "Đã lưu");
      if (resetOnSuccess) ref.current?.reset();
    } else {
      toast(state.error);
      // Đưa focus tới ô lỗi đầu tiên
      ref.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
    }
  }, [state, toast, resetOnSuccess]);

  return (
    <ErrorsContext value={state && !state.ok ? (state.fieldErrors ?? {}) : {}}>
      <form ref={ref} action={formAction} noValidate className={className}>
        {children}
      </form>
    </ErrorsContext>
  );
}

export function useFieldError(name: string) {
  return use(ErrorsContext)[name];
}

export function SubmitButton({ children, ...props }: ComponentProps<typeof Button>) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" disabled={pending} {...props}>
      {pending ? "Đang lưu…" : children}
    </Button>
  );
}

type Labelled = { label: ReactNode; hint?: ReactNode; className?: string };

export function FormInput({ label, hint, className, name, ...props }: Labelled & ComponentProps<"input"> & { name: string }) {
  const error = useFieldError(name);
  return (
    <Field label={label} hint={hint} error={error} className={className}>
      <Input name={name} aria-invalid={!!error} {...props} />
    </Field>
  );
}

export function FormTextarea({ label, hint, className, name, ...props }: Labelled & ComponentProps<"textarea"> & { name: string }) {
  const error = useFieldError(name);
  return (
    <Field label={label} hint={hint} error={error} className={className}>
      <Textarea name={name} aria-invalid={!!error} {...props} />
    </Field>
  );
}

export function FormSelect({ label, hint, className, name, children, ...props }: Labelled & ComponentProps<"select"> & { name: string }) {
  const error = useFieldError(name);
  return (
    <Field label={label} hint={hint} error={error} className={className}>
      <Select name={name} aria-invalid={!!error} {...props}>
        {children}
      </Select>
    </Field>
  );
}
