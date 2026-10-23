import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { purgeCdn } from "@/lib/cdn-purge";

/**
 * Webhook cho CMS/backend gọi khi nội dung thay đổi:
 *   POST /api/revalidate
 *   Header: x-revalidate-secret: <REVALIDATE_SECRET>
 *   Body:   { "tags": ["posts", "post:slug"], "paths": ["/blog", "/blog/slug"] }
 *
 * 1. Đánh dấu cache Next.js là stale (stale-while-revalidate, không làm chậm user)
 * 2. Purge CDN cho các đường dẫn liên quan
 */
export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || request.headers.get("x-revalidate-secret") !== secret) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { tags?: unknown; paths?: unknown };
  const tags = Array.isArray(body.tags) ? body.tags.filter((t): t is string => typeof t === "string") : [];
  const paths = Array.isArray(body.paths) ? body.paths.filter((p): p is string => typeof p === "string" && p.startsWith("/")) : [];

  for (const tag of tags) revalidateTag(tag, "max");
  for (const path of paths) revalidatePath(path);

  const cdn = await purgeCdn(paths);

  return NextResponse.json({ revalidated: true, tags, paths, cdn });
}
