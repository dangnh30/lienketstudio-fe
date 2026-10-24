"use client";

import Link from "next/link";
import { useSyncExternalStore, type ReactNode } from "react";
import { Button, buttonVariants } from "@/shared/ui/button";
import { logoutAction } from "@/features/auth/actions";

/*
 * Trang công khai là HTML tĩnh (cache CDN) nên server không biết ai đang xem.
 * Trình duyệt đọc cookie gợi ý "lk_role" (do server đặt khi đăng nhập) để chọn nút hiển thị.
 * Đây chỉ là giao diện – quyền truy cập luôn được kiểm ở server.
 */

type RoleHint = "customer" | "admin" | null;

function readRole(): RoleHint {
  const match = document.cookie.match(/(?:^|;\s*)lk_role=(customer|admin)/);
  return (match?.[1] as RoleHint) ?? null;
}

/** "unknown" khi render trên server / trước khi JS chạy */
function useRoleHint(): RoleHint | "unknown" {
  return useSyncExternalStore(
    () => () => {},
    readRole,
    () => "unknown" as const,
  );
}

export function PublicAccountActions() {
  const role = useRoleHint();
  if (role === "customer" || role === "admin") {
    return (
      <div className="flex items-center gap-2">
        <Link href={role === "admin" ? "/admin" : "/app"} className={buttonVariants({ size: "sm", variant: "primary", className: "no-underline" })}>
          {role === "admin" ? "Vào khu quản trị" : "Vào trang quản lý"}
        </Link>
        <form action={logoutAction}>
          <Button type="submit" size="sm">
            Đăng xuất
          </Button>
        </form>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <Link href="/login" className={buttonVariants({ size: "sm", className: "no-underline" })}>
        Đăng nhập
      </Link>
      <Link href="/signup" className={buttonVariants({ size: "sm", variant: "primary", className: "no-underline" })}>
        Đăng ký
      </Link>
    </div>
  );
}

/** Chỉ hiện với khách chưa đăng nhập (HTML tĩnh luôn có sẵn nội dung này cho bot) */
export function GuestOnly({ children }: { children: ReactNode }) {
  const role = useRoleHint();
  return role === "customer" || role === "admin" ? null : <>{children}</>;
}
