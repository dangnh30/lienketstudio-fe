import "server-only";
import { siteConfig } from "@/shared/config/site";

/**
 * revalidateTag/revalidatePath chỉ xoá cache của Next.js server.
 * CDN vẫn giữ bản cũ tới hết s-maxage => cần purge CDN song song.
 *
 * Mặc định dùng Cloudflare, purge theo prefix đường dẫn để xoá luôn các biến thể
 * RSC (?_rsc=...) của cùng trang. Không cấu hình env thì bỏ qua.
 * CDN_PURGE_MODE=everything => xoá toàn bộ cache zone (đơn giản, hợp với site nhỏ).
 */
export async function purgeCdn(paths: string[]) {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!zoneId || !token || paths.length === 0) return { skipped: true as const };

  const host = new URL(siteConfig.url).host;
  const body =
    process.env.CDN_PURGE_MODE === "everything"
      ? { purge_everything: true }
      : { prefixes: paths.map((p) => `${host}${p === "/" ? "" : p}`) };

  const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error("[cdn-purge] failed", res.status, await res.text());
    return { skipped: false as const, ok: false };
  }
  return { skipped: false as const, ok: true };
}
