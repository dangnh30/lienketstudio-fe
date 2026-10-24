"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

/**
 * Modal dựa trên <dialog> gốc: tự bẫy focus, Esc để đóng, trả focus về nút đã mở.
 */
export function Modal({ open, onClose, title, description, children, footer }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto max-h-[calc(100vh-32px)] w-[calc(100%-32px)] max-w-[480px] overflow-auto rounded-md bg-white p-0 text-ink shadow-modal backdrop:bg-[rgb(24_24_27/0.42)]"
    >
      <div className="flex items-start justify-between gap-3 px-5 pt-[18px] pb-3">
        <div>
          <h2 id={titleId} className="text-[17px]">
            {title}
          </h2>
          {description && <p className="mt-0.5 text-[13px] text-muted">{description}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="inline-flex size-9 cursor-pointer items-center justify-center rounded-sm border border-line bg-white hover:bg-soft"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
      <div className="px-5 pb-4 text-sm">{children}</div>
      {footer && <div className="flex justify-end gap-2 border-t border-line-2 bg-hover px-5 py-3">{footer}</div>}
    </dialog>
  );
}
