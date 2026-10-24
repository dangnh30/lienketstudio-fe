import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export const inputClassName =
  "min-h-[38px] w-full rounded-sm border border-line bg-white px-3 text-[14.5px] font-normal outline-none transition-[border-color,box-shadow] focus:border-accent focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-accent)_16%,transparent)] aria-invalid:border-danger";

type FieldProps = {
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
};

/** Label + control + lỗi. Lỗi gắn aria-live để trình đọc màn hình đọc được. */
export function Field({ label, hint, error, children, className }: FieldProps) {
  return (
    <label className={cn("flex flex-col gap-1.5 text-[13.5px] font-medium", className)}>
      {label}
      {children}
      {hint && <span className="text-[13px] font-normal text-muted">{hint}</span>}
      <span className="min-h-[18px] text-[13px] font-medium text-danger" aria-live="polite">
        {error}
      </span>
    </label>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(inputClassName, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(inputClassName, "py-2.5", className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(inputClassName, "cursor-pointer", className)} {...props} />;
}

/** Ô tích kèm nhãn và mô tả phụ (dùng trong form cài đặt) */
export function CheckboxField({
  label,
  hint,
  className,
  ...props
}: Omit<ComponentProps<"input">, "type"> & { label: ReactNode; hint?: ReactNode }) {
  return (
    <label className={cn("flex min-h-10 cursor-pointer items-start gap-2.5 text-[14.5px]", className)}>
      <input type="checkbox" className="mt-0.5 size-5 flex-none" {...props} />
      <span>
        {label}
        {hint && <span className="block text-[13px] text-muted">{hint}</span>}
      </span>
    </label>
  );
}

/** Dòng cài đặt dạng công tắc: nhãn bên trái, switch bên phải */
export function SwitchField({
  label,
  hint,
  ...props
}: Omit<ComponentProps<"input">, "type"> & { label: ReactNode; hint?: ReactNode }) {
  return (
    <label className="-mx-2.5 flex cursor-pointer items-center gap-3 rounded-sm px-2.5 py-[9px] text-[13.5px] hover:bg-hover">
      <span className="flex-1">
        <span className="font-medium">{label}</span>
        {hint && <span className="block text-[13px] text-muted">{hint}</span>}
      </span>
      <Switch {...props} />
    </label>
  );
}

export function FieldGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">{children}</div>;
}

export function Switch({ className, ...props }: Omit<ComponentProps<"input">, "type">) {
  return (
    <input
      type="checkbox"
      role="switch"
      className={cn(
        "relative h-[22px] w-[38px] flex-none cursor-pointer appearance-none rounded-sm bg-[#d4d5da] transition-colors checked:bg-accent",
        "after:absolute after:top-[3px] after:left-[3px] after:size-4 after:rounded-xs after:bg-white after:shadow-[0_1px_3px_rgb(0_0_0/0.25)] after:transition-transform checked:after:translate-x-4",
        className,
      )}
      {...props}
    />
  );
}
