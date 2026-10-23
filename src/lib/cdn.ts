const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL?.replace(/\/$/, "") ?? "";

/**
 * assetPrefix chỉ áp dụng cho /_next/static. File trong /public cần tự gắn prefix CDN.
 * Dùng: <img src={cdn("/images/logo.png")} />
 */
export function cdn(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  return `${CDN_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
