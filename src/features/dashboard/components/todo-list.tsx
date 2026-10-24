import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export type TodoItem = {
  count: number;
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
  /** Lớp màu nền + chữ cho ô icon */
  iconClassName: string;
};

export function TodoList({ items }: { items: TodoItem[] }) {
  const visible = items.filter((i) => i.count > 0);
  if (!visible.length) {
    return <p className="py-3 text-muted">Không còn việc nào cần bạn xử lý. Hệ thống đang tự chạy.</p>;
  }
  return (
    <ul className="-mx-2.5 flex flex-col">
      {visible.map((item) => (
        <li key={item.href} className="relative [&+&]:before:absolute [&+&]:before:top-0 [&+&]:before:right-2.5 [&+&]:before:left-[58px] [&+&]:before:border-t [&+&]:before:border-line-2">
          <Link href={item.href} className="group flex items-center gap-3 rounded-sm px-2.5 py-3 text-ink no-underline transition-colors hover:bg-soft">
            <span className={cn("flex size-9 flex-none items-center justify-center rounded-sm", item.iconClassName)}>{item.icon}</span>
            <div className="min-w-0 flex-1">
              <b>
                {item.count} {item.title}
              </b>
              <div className="text-[13px] text-muted">{item.description}</div>
            </div>
            <span className="text-[13px] font-medium text-muted transition-colors group-hover:text-accent-ink">Xử lý</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
