/** Sàn thương mại điện tử có nguồn sản phẩm affiliate */
export const PLATFORMS = ["shopee", "tiktokshop"] as const;
export type Platform = (typeof PLATFORMS)[number];

export const PLATFORM_LABEL: Record<Platform, string> = {
  shopee: "Shopee",
  tiktokshop: "TikTok Shop",
};

/** Kênh đăng bài */
export const CHANNELS = ["fbpage", "fbgroup", "tiktok"] as const;
export type Channel = (typeof CHANNELS)[number];

export const CHANNEL_LABEL: Record<Channel, string> = {
  fbpage: "Facebook Page",
  fbgroup: "Facebook Group",
  tiktok: "TikTok",
};

/** Cách một kênh được đăng: tự động qua API, hay người dùng đăng tay */
export const CHANNEL_MODE: Record<Channel, "auto" | "manual"> = {
  fbpage: "auto",
  fbgroup: "manual", // Meta đã gỡ API đăng vào Group
  tiktok: "manual", // Gắn giỏ hàng TikTok Shop phải làm trong app
};

export function isChannel(value: string): value is Channel {
  return (CHANNELS as readonly string[]).includes(value);
}
