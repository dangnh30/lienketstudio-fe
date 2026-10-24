"use client";

import Link from "next/link";
import { initials } from "@/shared/lib/format";
import { Popover } from "@/shared/ui/popover";
import { logoutAction } from "@/features/auth/actions";

type UserMenuProps = {
  name: string;
  email: string;
  role: string;
  links: { href: string; label: string }[];
};

const itemClass =
  "block w-full cursor-pointer border-t border-line-2 bg-transparent px-3.5 py-2.5 text-left text-[13.5px] text-ink no-underline hover:bg-soft";

export function UserMenu({ name, email, role, links }: UserMenuProps) {
  return (
    <Popover
      className="top-11 w-[260px]"
      trigger={({ open, toggle, controlsId }) => (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-controls={controlsId}
          aria-label="Tài khoản"
          className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full border-0 bg-[#3f3f46] text-xs font-semibold text-white max-[900px]:hidden"
        >
          {initials(name)}
        </button>
      )}
    >
      <div className="px-3.5 py-3">
        <b>{name}</b>
        <div className="text-[13px] text-muted">{email}</div>
        <div className="text-[13px] text-muted">{role}</div>
      </div>
      {links.map((l) => (
        <Link key={l.href} href={l.href} className={itemClass}>
          {l.label}
        </Link>
      ))}
      <form action={logoutAction}>
        <button type="submit" className={itemClass}>
          Đăng xuất
        </button>
      </form>
    </Popover>
  );
}
