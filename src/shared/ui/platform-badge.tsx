import { CHANNEL_LABEL, PLATFORM_LABEL, type Channel, type Platform } from "@/domain/platform";
import { Badge } from "./badge";

export function PlatformBadge({ platform }: { platform: Platform }) {
  return <Badge tone={platform === "shopee" ? "shopee" : "tiktok"}>{PLATFORM_LABEL[platform]}</Badge>;
}

export function ChannelBadge({ channel }: { channel: Channel }) {
  return <Badge tone={channel === "tiktok" ? "tiktok" : "fb"}>{CHANNEL_LABEL[channel]}</Badge>;
}
