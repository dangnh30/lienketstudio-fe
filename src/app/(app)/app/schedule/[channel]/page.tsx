import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CHANNEL_LABEL, CHANNELS, isChannel, type Channel } from "@/domain/platform";
import { Count } from "@/shared/ui/badge";
import { PageHeader } from "@/shared/ui/page-header";
import { Segment, Segmented } from "@/shared/ui/segmented";
import { FacebookGroupPanel, FacebookPagePanel, TikTokPanel } from "@/features/publishing/components/channel-panels";
import { getSchedule } from "@/features/publishing/server/queries";

export const metadata: Metadata = { title: "Lịch đăng" };

const PANELS: Record<Channel, typeof FacebookPagePanel> = {
  fbpage: FacebookPagePanel,
  fbgroup: FacebookGroupPanel,
  tiktok: TikTokPanel,
};

export default async function SchedulePage({ params }: PageProps<"/app/schedule/[channel]">) {
  const { channel } = await params;
  if (!isChannel(channel)) notFound();

  const { entries, readyCounts, settings, postedToday } = await getSchedule(channel);
  const Panel = PANELS[channel];

  return (
    <>
      <PageHeader title="Lịch đăng" description="Facebook Page đăng tự động · Facebook Group và TikTok cần bạn đăng" />
      <Segmented label="Kênh đăng">
        {CHANNELS.map((c) => (
          <Segment key={c} href={`/app/schedule/${c}`} active={c === channel}>
            {CHANNEL_LABEL[c]}
            {readyCounts[c] > 0 && <Count className="bg-accent text-white">{readyCounts[c]}</Count>}
          </Segment>
        ))}
      </Segmented>
      <Panel entries={entries} settings={settings} postedToday={postedToday} />
    </>
  );
}
