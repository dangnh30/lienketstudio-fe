"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type PopoverProps = {
  trigger: (props: { open: boolean; toggle: () => void; controlsId: string }) => ReactNode;
  children: ReactNode;
  className?: string;
};

/** Popover nhẹ: đóng khi bấm ra ngoài hoặc nhấn Escape. */
export function Popover({ trigger, children, className }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {trigger({ open, toggle: () => setOpen((v) => !v), controlsId: id })}
      {open && (
        <div
          id={id}
          className={cn(
            "absolute top-11 right-0 z-40 w-[360px] max-w-[86vw] overflow-hidden rounded-md border border-line bg-white shadow-pop",
            className,
          )}
          onClick={(e) => {
            // Bấm vào link bên trong thì đóng popover
            if ((e.target as HTMLElement).closest("a")) setOpen(false);
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export const iconButtonClassName =
  "relative inline-flex size-9 cursor-pointer items-center justify-center rounded-sm border border-line bg-white text-ink-2 transition-colors hover:bg-soft";
