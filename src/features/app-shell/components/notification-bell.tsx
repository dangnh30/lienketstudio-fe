"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useTransition } from "react";
import type { Notification } from "@/domain/workspace";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { iconButtonClassName, Popover } from "@/shared/ui/popover";
import { markAllNotificationsReadAction } from "../actions";

export function NotificationBell({ notifications }: { notifications: Notification[] }) {
  const unread = notifications.filter((n) => !n.read).length;
  const [pending, startTransition] = useTransition();

  return (
    <Popover
      trigger={({ open, toggle, controlsId }) => (
        <button
          type="button"
          className={iconButtonClassName}
          onClick={toggle}
          aria-expanded={open}
          aria-controls={controlsId}
          aria-label={`Thông báo, ${unread} chưa đọc`}
        >
          <Bell className="size-[18px]" strokeWidth={1.9} aria-hidden="true" />
          {unread > 0 && (
            <span className="absolute -top-[5px] -right-[5px] flex h-[18px] min-w-[18px] items-center justify-center rounded-[3px] border-2 border-white bg-accent px-[5px] text-[11px] font-semibold text-white">
              {unread}
            </span>
          )}
        </button>
      )}
    >
      <div className="flex items-center justify-between border-b border-line-2 px-3.5 py-3">
        <b>Thông báo</b>
        <span className="text-[13px] text-muted">{unread} chưa đọc</span>
      </div>
      {notifications.map((n) => (
        <Link
          key={n.id}
          href={n.href}
          className={cn(
            "relative block border-t border-line-2 py-[11px] pr-3.5 pl-7 text-[13.5px] text-ink no-underline first-of-type:border-t-0 hover:bg-soft",
            !n.read && "bg-accent-row before:absolute before:top-[17px] before:left-3 before:size-[7px] before:rounded-full before:bg-accent",
          )}
        >
          <div>{n.text}</div>
          <div className="text-[13px] text-muted">{n.time}</div>
        </Link>
      ))}
      <div className="border-t border-line-2 px-3.5 py-2">
        <Button
          size="sm"
          className="w-full"
          disabled={!unread || pending}
          onClick={() => startTransition(() => markAllNotificationsReadAction())}
        >
          Đánh dấu đã đọc tất cả
        </Button>
      </div>
    </Popover>
  );
}
