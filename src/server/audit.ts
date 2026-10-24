import "server-only";
import { headers } from "next/headers";
import type { AuditKind } from "@/domain/platform-admin";
import { repositories } from "./container";

const pad = (n: number) => String(n).padStart(2, "0");

function nowLabel() {
  const d = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Ẩn octet cuối của IP trước khi lưu nhật ký (giảm dữ liệu cá nhân) */
function maskIp(raw: string | null) {
  const ip = raw?.split(",")[0]?.trim();
  if (!ip) return "—";
  return ip.includes(".") ? ip.replace(/\.\d+\.\d+$/, ".x.x") : ip.replace(/:[^:]*:[^:]*$/, ":x:x");
}

/** Ghi một dòng nhật ký (chỉ thêm, không sửa/xóa) */
export async function recordAudit(entry: { actor: string; action: string; target?: string; kind: AuditKind }) {
  const h = await headers();
  await repositories().audit.append({
    at: nowLabel(),
    actor: entry.actor,
    action: entry.action,
    target: entry.target ?? "—",
    ip: maskIp(h.get("x-forwarded-for") ?? h.get("x-real-ip")),
    kind: entry.kind,
  });
}
