"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import type { VariantProps } from "class-variance-authority";
import type { ActionResult } from "@/shared/lib/action-result";
import { Button, type buttonVariants } from "./button";
import { useToast } from "./toast";

type ActionButtonProps = {
  action: () => Promise<ActionResult<unknown>>;
  children: ReactNode;
  disabled?: boolean;
  title?: string;
  className?: string;
  /** Gọi sau khi action thành công (vd. đóng modal) */
  onSuccess?: () => void;
} & VariantProps<typeof buttonVariants>;

/** Nút gọi một server action, tự khoá khi đang chạy và báo kết quả bằng toast */
export function ActionButton({ action, children, variant, size = "sm", disabled, title, className, onSuccess }: ActionButtonProps) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant={variant}
      size={size}
      disabled={pending || disabled}
      title={title}
      className={className}
      onClick={() =>
        startTransition(async () => {
          const result = await action();
          toast(result.ok ? (result.message ?? "Đã lưu") : result.error);
          if (result.ok) onSuccess?.();
        })
      }
    >
      {children}
    </Button>
  );
}

/**
 * Thao tác nguy hiểm: bấm lần 1 để "lên đạn", bấm lần 2 trong 4 giây để thực hiện.
 * Tránh hộp thoại xác nhận chặn luồng mà vẫn chống bấm nhầm.
 */
export function ConfirmActionButton({
  action,
  children,
  confirmLabel = "Bấm lần nữa để xác nhận",
  size = "sm",
}: {
  action: () => Promise<ActionResult<unknown>>;
  children: ReactNode;
  confirmLabel?: string;
  size?: VariantProps<typeof buttonVariants>["size"];
}) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(t);
  }, [armed]);

  return armed ? (
    <ActionButton variant="danger" size={size} action={action} onSuccess={() => setArmed(false)}>
      {confirmLabel}
    </ActionButton>
  ) : (
    <Button variant="danger" size={size} onClick={() => setArmed(true)}>
      {children}
    </Button>
  );
}

/** Nút sao chép văn bản vào clipboard */
export function CopyButton({ text, label, done }: { text: string; label: string; done: string }) {
  const toast = useToast();
  return (
    <Button
      size="sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          toast(done);
        } catch {
          toast("Trình duyệt chặn sao chép, hãy chọn và sao chép thủ công");
        }
      }}
    >
      {label}
    </Button>
  );
}
