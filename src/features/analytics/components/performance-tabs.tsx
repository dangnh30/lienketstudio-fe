import Link from "next/link";
import { Box, ChartColumn, CircleCheck, Inbox, Send, Tag, Video } from "lucide-react";
import { formatNumber, formatPercent, formatVnd } from "@/shared/lib/format";
import { ButtonLink } from "@/shared/ui/button";
import { Card, CardHeader } from "@/shared/ui/card";
import { ColumnChart, DataTableDetails, Funnel, HBars, LineChart } from "@/shared/ui/charts";
import { Delta, Kpi, KpiStrip, Note } from "@/shared/ui/kpi";
import { ChannelBadge, PlatformBadge } from "@/shared/ui/platform-badge";
import { ProductThumb } from "@/shared/ui/product-thumb";
import { Table, TableScroll, Td, Th, Tr } from "@/shared/ui/table";
import type { AnalyticsService } from "../server/analytics.service";
import type { Range } from "../range";

const icon = "size-4";
type Revenue = Awaited<ReturnType<AnalyticsService["revenue"]>>;
type Posts = Awaited<ReturnType<AnalyticsService["posts"]>>;
type FunnelData = Awaited<ReturnType<AnalyticsService["funnel"]>>;

export function RevenueTab({ data, days }: { data: Revenue; days: Range }) {
  const suffix = `so với ${days} ngày trước`;
  return (
    <>
      <KpiStrip>
        <Kpi label="Hoa hồng" icon={<Tag className={icon} />} value={formatVnd(data.totals.commission)} footer={<Delta value={data.change.commission} suffix={suffix} />} />
        <Kpi label="Đơn hàng" icon={<Box className={icon} />} value={formatNumber(data.totals.orders)} footer={<Delta value={data.change.orders} suffix={suffix} />} />
        <Kpi href="/app/links" label="Lượt bấm link" icon={<Send className={icon} />} value={formatNumber(data.totals.clicks)} footer={<Delta value={data.change.clicks} suffix={suffix} />} />
        <Kpi label="Tỷ lệ chuyển đổi" icon={<ChartColumn className={icon} />} value={formatPercent(data.conversion)} footer={<Note>Đơn / lượt bấm</Note>} />
      </KpiStrip>

      <Card padded>
        <CardHeader
          title="Hoa hồng theo ngày"
          description={`${days} ngày gần nhất · rê chuột để xem từng ngày`}
          action={
            <div className="flex gap-[22px]">
              <div>
                <span className="text-[13px] text-muted">Đã duyệt</span>
                <b className="block text-base tnum">{formatVnd(data.approvedCommission)}</b>
              </div>
              <div>
                <span className="text-[13px] text-muted">Chờ duyệt</span>
                <b className="block text-base tnum">{formatVnd(data.pendingCommission)}</b>
              </div>
            </div>
          }
        />
        <div className="mt-2.5">
          <LineChart primary={{ values: data.current.map((r) => r.commission), name: "Hoa hồng" }} labels={data.labels} format={formatVnd} />
        </div>
        <DataTableDetails
          head={["Ngày", "Lượt bấm", "Đơn", "Hoa hồng"]}
          rows={data.current.map((r, i) => [data.labels[i], formatNumber(r.clicks), formatNumber(r.orders), formatVnd(r.commission)]).reverse()}
        />
      </Card>

      <div className="flex flex-wrap items-stretch gap-4">
        <Card padded className="flex-[1_1_320px]">
          <CardHeader title="Theo sàn" description={`Hoa hồng ${days} ngày`} className="mb-3.5" />
          <HBars
            format={formatVnd}
            rows={data.platforms.map((p) => ({
              label: p.label,
              value: p.commission,
              note: `${formatNumber(p.orders)} đơn · hoa hồng TB ${formatPercent(p.avgCommission)}`,
            }))}
          />
        </Card>
        <Card padded className="flex-[1.4_1_380px]">
          <CardHeader title="Đơn theo khung giờ" description={`Giờ người mua bấm link, cộng dồn ${days} ngày · 2 khung cao nhất được tô đậm`} className="mb-1.5" />
          <ColumnChart values={data.hours.map((h) => h.orders)} labels={data.hours.map((h) => h.label)} format={formatNumber} name="Đơn" highlightTop={2} width={500} />
        </Card>
      </div>

      <Card>
        <div className="px-5 pt-[18px] pb-1.5">
          <h2 className="text-[15px]">Sản phẩm mang lại nhiều hoa hồng nhất</h2>
        </div>
        <TableScroll>
          <Table className="min-w-[640px]">
            <thead>
              <tr>
                <Th>Sản phẩm</Th>
                <Th align="right">Lượt bấm</Th>
                <Th align="right">Đơn</Th>
                <Th align="right">Chuyển đổi</Th>
                <Th align="right">Hoa hồng</Th>
              </tr>
            </thead>
            <tbody>
              {data.topProducts.map((t) => (
                <Tr key={t.deal.id}>
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <ProductThumb id={t.deal.id} size={36} />
                      <div>
                        <b>{t.deal.name}</b>
                        <div className="flex gap-1.5 text-[13px]">
                          {t.deal.offers.map((o) => (
                            <PlatformBadge key={o.platform} platform={o.platform} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </Td>
                  <Td align="right">{formatNumber(t.clicks)}</Td>
                  <Td align="right">{formatNumber(t.orders)}</Td>
                  <Td align="right">{t.clicks ? formatPercent((t.orders / t.clicks) * 100) : "—"}</Td>
                  <Td align="right">
                    <b>{formatVnd(t.commission)}</b>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableScroll>
      </Card>

      <Card padded className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px]">
          <b>Thuế:</b> tổng hợp hoa hồng và chứng từ khấu trừ theo nguồn để quyết toán thuế thu nhập cá nhân.
        </p>
        <ButtonLink href={`/app/export?type=income&range=${days}`} size="sm" prefetch={false}>
          Xuất báo cáo thu nhập
        </ButtonLink>
      </Card>
    </>
  );
}

export function PostsTab({ data, days }: { data: Posts; days: Range }) {
  const posts = [
    ["20/10 20:00", "tiktok", "g", 2140, 61],
    ["21/10 12:00", "fbpage", "a", 980, 34],
    ["19/10 20:00", "fbpage", "h", 760, 22],
    ["18/10 19:30", "tiktok", "b", 1320, 29],
    ["21/10 09:10", "fbgroup", "g", 410, 12],
    ["17/10 12:00", "fbpage", "c", 530, 11],
  ] as const;
  const manual = data.channels.filter((c) => c.perPost !== null).sort((a, b) => (b.perPost ?? 0) - (a.perPost ?? 0));

  return (
    <>
      <KpiStrip>
        <Kpi label="Bài đã đăng" icon={<Send className={icon} />} value={formatNumber(data.totalPosts)} footer={<Note>Facebook Page, Group và TikTok</Note>} />
        <Kpi label="Lượt bấm trung bình mỗi bài" icon={<ChartColumn className={icon} />} value={formatNumber(data.clicksPerPost)} footer={<Delta value={data.clicksPerPostChange} suffix={`so với ${days} ngày trước`} />} />
        <Kpi label="Lượt xem video TikTok" icon={<Video className={icon} />} value={formatNumber(data.tiktokViews)} footer={<Note>Qua Display API</Note>} />
        <Kpi label="Bài bị bỏ trước giờ đăng" icon={<CircleCheck className={icon} />} iconTone="warn" value={data.droppedBeforePost} footer={<Note>Giá đổi hơn 2% hoặc hết hàng</Note>} />
      </KpiStrip>

      <div className="flex flex-wrap items-stretch gap-4">
        <Card padded className="flex-[1_1_340px]">
          <CardHeader title="Hoa hồng theo kênh" description={`${days} ngày · xếp từ cao xuống thấp`} className="mb-3.5" />
          <HBars
            format={formatVnd}
            rows={[...data.channels]
              .sort((a, b) => b.commissionShare - a.commissionShare)
              .map((c) => ({
                label: c.label,
                value: c.commission,
                note: `${c.posts === null ? "Trang tĩnh, không đăng bài" : `${formatNumber(c.posts)} bài`} · ${Math.round(c.commissionShare * 100)}% tổng`,
              }))}
          />
        </Card>
        <Card padded className="flex-[1_1_340px]">
          <CardHeader title="Hoa hồng trung bình mỗi bài" description="Cho biết kênh nào đáng bỏ công đăng tay" className="mb-3.5" />
          <HBars format={formatVnd} rows={manual.map((c) => ({ label: c.label, value: c.perPost ?? 0, note: c.note }))} />
        </Card>
      </div>

      <Card>
        <div className="px-5 pt-[18px] pb-1.5">
          <h2 className="text-[15px]">Bài hiệu quả nhất</h2>
        </div>
        <TableScroll>
          <Table className="min-w-[700px]">
            <thead>
              <tr>
                <Th>Thời gian</Th>
                <Th>Kênh</Th>
                <Th>Sản phẩm</Th>
                <Th align="right">Lượt bấm</Th>
                <Th align="right">Đơn</Th>
                <Th align="right">Chuyển đổi</Th>
              </tr>
            </thead>
            <tbody>
              {posts.map(([at, channel, dealId, clicks, orders]) => (
                <Tr key={`${at}-${dealId}`}>
                  <Td className="text-[13px] tnum">{at}</Td>
                  <Td>
                    <ChannelBadge channel={channel} />
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <ProductThumb id={dealId} size={32} />
                      <b className="font-medium">[Model {dealId.toUpperCase()}]</b>
                    </div>
                  </Td>
                  <Td align="right">{formatNumber(clicks)}</Td>
                  <Td align="right">{orders}</Td>
                  <Td align="right">{formatPercent((orders / clicks) * 100)}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableScroll>
      </Card>
    </>
  );
}

export function FilterTab({ data, days }: { data: FunnelData; days: Range }) {
  const firstDrop = data.tracked - data.steps[0].value;
  return (
    <>
      <KpiStrip>
        <Kpi label="Sản phẩm đang theo dõi giá" icon={<Box className={icon} />} value={formatNumber(data.tracked)} footer={<Note>Quét theo tầng, ngách {data.niches.join(", ")}</Note>} />
        <Kpi label="Deal vào hàng duyệt" icon={<Inbox className={icon} />} value={formatNumber(data.reviewed)} footer={<Note>≈ {(data.reviewed / days).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} deal mỗi ngày</Note>} />
        <Kpi label="Tỷ lệ bạn duyệt" icon={<CircleCheck className={icon} />} value={`${data.approvalRate}%`} footer={<Note>Cao và ổn định thì có thể tắt duyệt tay</Note>} />
        <Kpi label="Bắt được giảm ảo" icon={<Tag className={icon} />} iconTone="warn" value={formatNumber(data.fakeCaught)} footer={<Note>Không bao giờ được đăng</Note>} />
      </KpiStrip>

      <Card padded>
        <CardHeader
          title="Phễu lọc deal"
          description={`Từ ${formatNumber(data.tracked)} sản phẩm theo dõi, ${days} ngày qua. Mỗi dòng là số sản phẩm còn lại sau vòng lọc đó.`}
          action={<ButtonLink href="/app/settings/filter" size="sm">Chỉnh bộ lọc</ButtonLink>}
        />
        <Funnel steps={data.steps} format={formatNumber} highlightFrom={4} />
        <p className="mt-2.5 text-[13px] text-muted">
          Vòng 1 loại phần lớn: {formatNumber(firstDrop)} sản phẩm ({Math.round((firstDrop / data.tracked) * 100)}%) không giảm đủ sâu.
        </p>
      </Card>

      <div className="flex flex-wrap items-stretch gap-4">
        <Card padded className="flex-[1_1_340px]">
          <CardHeader title="Lý do bị loại" description="Sau vòng 1, xếp từ nhiều đến ít" className="mb-3.5" />
          <HBars format={formatNumber} rows={data.reasons} />
        </Card>
        <Card padded className="flex-[1.3_1_380px]">
          <CardHeader title="Deal mới mỗi ngày" description="Số deal đạt điểm vào hàng duyệt · 3 ngày nhiều nhất được tô đậm" className="mb-1.5" />
          <ColumnChart
            values={data.newPerDay.map((d) => d.value)}
            labels={data.newPerDay.map((d, i, a) => (a.length > 14 && i % Math.ceil(a.length / 8) ? "" : d.label))}
            format={formatNumber}
            name="Deal mới"
            highlightTop={3}
            width={560}
          />
          {days > 30 && <p className="text-[13px] text-muted">Hiển thị 30 ngày gần nhất</p>}
        </Card>
      </div>
      <p className="text-[13px] text-muted">
        Muốn đổi ngưỡng lọc? <Link href="/app/settings/filter">Mở Bộ lọc và đăng bài</Link>.
      </p>
    </>
  );
}
