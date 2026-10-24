import Link from "next/link";
import { ChartColumn, CircleCheck, Link2, Send, Tag, Users, Video } from "lucide-react";
import { CHANNEL_LABEL } from "@/domain/platform";
import { formatVnd } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/badge";
import { Banner } from "@/shared/ui/banner";
import { ButtonLink } from "@/shared/ui/button";
import { Card, CardHeader } from "@/shared/ui/card";
import { Delta, Kpi, KpiStrip, Note } from "@/shared/ui/kpi";
import { PageHeader } from "@/shared/ui/page-header";
import { ProgressBar, Sparkline } from "@/shared/ui/sparkline";
import { TodoList } from "@/features/dashboard/components/todo-list";
import { getOverview } from "@/features/dashboard/server/queries";

const icon = "size-4";
const today = new Intl.DateTimeFormat("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", timeZone: "Asia/Ho_Chi_Minh" });

export default async function OverviewPage() {
  const data = await getOverview();
  const todo = data.tiktokReady + data.groupReady + data.matchPending;

  return (
    <>
      <PageHeader
        title="Tổng quan"
        description={`${today.format(new Date())}. Ngách ${data.niches.join(", ") || "chưa chọn"}`}
      />
      {data.paused && (
        <Banner action={<ButtonLink href="/app/settings/system" size="sm">Mở lại trong Cài đặt</ButtonLink>}>
          <b>Đã tạm dừng toàn bộ đăng bài.</b> Hệ thống vẫn quét giá nhưng không đăng lên Facebook và không tạo gói TikTok.
        </Banner>
      )}

      <KpiStrip>
        <Kpi href="/app/review" label="Deal chờ duyệt" icon={<Tag className={icon} />} value={data.reviewCount}
          chart={<Sparkline values={[2, 4, 3, 5, 3, 6, 4, 5, 7, 4, 3, 5, 1, 3]} label="Deal mới 14 ngày" />} />
        <Kpi href="/app/schedule/fbpage" label="Facebook Page hôm nay" icon={<Send className={icon} />}
          value={data.fbPage.posted} unit={`/ ${data.fbPage.cap} bài`}
          chart={<div className="mt-auto pt-5"><ProgressBar value={(data.fbPage.posted / data.fbPage.cap) * 100} /></div>} />
        <Kpi href="/app/schedule/tiktok" label="Việc cần bạn làm" icon={<CircleCheck className={icon} />} iconTone="warn"
          value={todo} footer={<span className="mt-auto"><Note>{todo ? "Bài TikTok, Group, ghép sản phẩm" : "Đã xong hết"}</Note></span>} />
        <Kpi href="/app/performance" label="Hoa hồng 14 ngày" icon={<ChartColumn className={icon} />}
          value={formatVnd(data.commission.total)}
          chart={<Sparkline values={data.commission.series} label="Hoa hồng 14 ngày" filled />}
          footer={<Delta value={data.commission.changePercent} suffix="so với 14 ngày trước" />} />
      </KpiStrip>

      <div className="flex flex-wrap items-start gap-4">
        <Card padded className="flex-[2_1_460px]">
          <CardHeader title="Việc cần bạn làm hôm nay" className="mb-1.5" />
          <TodoList
            items={[
              { count: data.reviewCount, title: "Deal chờ duyệt", description: "Shopee và TikTok Shop, đã qua bộ lọc", href: "/app/review", icon: <Tag className={icon} />, iconClassName: "bg-accent-bg text-accent-ink" },
              { count: data.tiktokReady, title: "Gói video TikTok cần đăng", description: 'Mở TikTok, gắn giỏ hàng, đăng, rồi bấm "Đã đăng"', href: "/app/schedule/tiktok", icon: <Video className={icon} />, iconClassName: "bg-tiktok-bg text-tiktok" },
              { count: data.groupReady, title: "Bài soạn sẵn cho Facebook Group", description: 'Sao chép, dán vào Group, rồi bấm "Đã đăng"', href: "/app/schedule/fbgroup", icon: <Users className={icon} />, iconClassName: "bg-fb-bg text-fb" },
              { count: data.matchPending, title: "Gợi ý ghép sản phẩm cần xác nhận", description: "Shopee ↔ TikTok Shop", href: "/app/matching", icon: <Link2 className={icon} />, iconClassName: "bg-warn-bg text-warn" },
            ]}
          />
        </Card>

        <Card padded className="flex flex-[1_1_280px] flex-col gap-2">
          <CardHeader title={`${CHANNEL_LABEL.fbpage} tự động`} />
          <ul className="flex flex-col">
            {data.fbPage.items.map((q) => (
              <li key={q.id} className="flex items-center justify-between gap-3 border-t border-line-2 py-2 text-[13px]">
                <span>
                  <b className="tnum">{q.time}</b> {q.dealName}
                </span>
                <Badge tone={q.status === "posted" ? "ok" : "neutral"}>{q.status === "posted" ? "Đã đăng" : "Đã lên lịch"}</Badge>
              </li>
            ))}
          </ul>
          <Link href="/app/schedule/fbpage" className="text-[13px] font-medium">
            Xem lịch đăng
          </Link>
        </Card>
      </div>

      <Card padded className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px]">
          <b>Nguồn dữ liệu:</b> AccessTrade (Shopee, TikTok Shop) · Shopee Open API · Facebook Page đã kết nối
        </p>
        <ButtonLink href="/app/sources" size="sm">Kết nối và nguồn</ButtonLink>
      </Card>
    </>
  );
}
