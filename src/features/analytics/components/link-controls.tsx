"use client";

import { useOptimistic, useTransition } from "react";
import { CopyButton } from "@/shared/ui/action-button";
import { Switch } from "@/shared/ui/field";
import { useToast } from "@/shared/ui/toast";
import { setLinkEnabledAction } from "../actions";

export function LinkControls({ code, url, enabled }: { code: string; url: string; enabled: boolean }) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(enabled);

  return (
    <div className="flex items-center justify-end gap-1.5">
      <CopyButton text={url} label="Sao chép" done={`Đã sao chép ${url.replace(/^https?:\/\//, "")}`} />
      <Switch
        checked={optimistic}
        disabled={pending}
        aria-label={`Bật link ${code}`}
        title={optimistic ? "Đang chuyển hướng" : "Đã tắt"}
        onChange={(e) => {
          const next = e.target.checked;
          startTransition(async () => {
            setOptimistic(next);
            const result = await setLinkEnabledAction(code, next);
            toast(result.ok ? (result.message ?? "Đã lưu") : result.error);
          });
        }}
      />
    </div>
  );
}
