import type { Metadata } from "next";
import { Box, CircleCheck, Inbox, MousePointerClick } from "lucide-react";
import { LINK_CHANNEL_LABEL, type LinkChannel } from "@/domain/catalog";
import { formatNumber, formatPercent } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/badge";
import { Card, CardHeader, Code, InfoRow } from "@/shared/ui/card";
import { DataTableDetails, HBars, Legend, LineChart } from "@/shared/ui/charts";
import { Kpi, KpiStrip, Note } from "@/shared/ui/kpi";
import { PageHeader } from "@/shared/ui/page-header";
import { ProductThumb } from "@/shared/ui/product-thumb";
import { Segment, Segmented } from "@/shared/ui/segmented";
import { Table, TableScroll, Td, Th, Tr } from "@/shared/ui/table";
import { requireCustomer } from "@/server/auth/dal";
import { LinkControls } from "@/features/analytics/components/link-controls";
import { RangePicker } from "@/features/analytics/components/range-picker";
import { parseRange } from "@/features/analytics/range";
import { analyticsService } from "@/features/analytics/server/analytics.service";

export const metadata: Metadata = { title: "Liên kết" };

const icon = "size-4";
const SHORT_DOMAIN = (process.env.NEXT_PUBLIC_SHORTLINK_URL ?? "https://go.lienket.vn").replace(/\/$/, "");
const FILTERS: ("all" | LinkChannel)[] = ["all", "fbpage", "fbgroup", "site"];

export default async function LinksPage({ searchParams }: PageProps<"/app/links">) {
  const query = await searchParams;
  const days = parseRange(query.range);
  const filter = FILTERS.find((f) => f === query.channel) ?? "all";
  const { workspaceId } = await requireCustomer();
  const data = await analyticsService().links(workspaceId, days);
  const links = data.links.filter((l) => filter === "all" || l.channel === filter);

  return (
    <>
      <PageHeader
        title="Liên kết"
        description="Lượt bấm tự đếm qua link rút gọn, so với số Shopee và AccessTrade ghi nhận"
        actions={<RangePicker basePath="/app/links" current={days} params={filter === "all" ? {} : { channel: filter }} />}
      />

      <KpiStrip>
        <Kpi label="Lượt bấm tự đếm" icon={<MousePointerClick className={icon} />} value={formatNumber(data.total.own)} footer={<Note>Đã loại lượt bấm của bot</Note>} />
        <Kpi label="Sàn ghi nhận" icon={<CircleCheck className={icon} />} value={formatNumber(data.total.platform)} footer={<Note>Khớp {data.matchPercent}% số tự đếm</Note>} />
        <Kpi label="Đơn hàng" icon={<Box className={icon} />} value={formatNumber(data.orders)} footer={<Note>Chuyển đổi {formatPercent(data.conversion)} trên lượt sàn ghi nhận</Note>} />
        <Kpi label="Bot đã lọc" icon={<Inbox className={icon} />} iconTone="warn" value={formatNumber(data.total.bots)} footer={<Note>{data.botPercent}% tổng lượt mở link</Note>} />
      </KpiStrip>

      <Card padded>
        <CardHeader
          title="Lượt bấm theo ngày"
          description="Rê chuột để xem từng ngày"
          action={<Legend items={[{ label: "Tự đếm" }, { label: "Sàn ghi nhận", dashed: true }]} />}
        />
        <div className="mt-2.5">
          <LineChart
            primary={{ values: data.series.own, name: "Tự đếm" }}
            secondary={{ values: data.series.platform, name: "Sàn ghi nhận" }}
            labels={data.labels}
            format={(v) => `${formatNumber(v)} lượt`}
          />
        </div>
        <p className="mt-2 text-[13px] text-muted">
          Sàn thường ghi thấp hơn vì gộp các lần bấm lặp lại của cùng một người và bỏ lượt bấm không mở được app Shopee.
        </p>
        <DataTableDetails
          head={["Ngày", "Tự đếm", "Sàn ghi nhận", "Bot đã lọc"]}
          rows={data.labels.map((l, i) => [l, formatNumber(data.series.own[i]), formatNumber(data.series.platform[i]), formatNumber(data.series.bots[i])]).reverse()}
        />
      </Card>

      <div className="flex flex-wrap items-stretch gap-4">
        <Card padded className="flex-[1_1_300px]">
          <CardHeader title="Theo nguồn" description="Nơi người xem bấm link" className="mb-3.5" />
          <HBars rows={data.sources} format={formatNumber} />
        </Card>
        <Card padded className="flex-[1_1_300px]">
          <CardHeader title="Theo thiết bị" description="Đa số mở trên điện thoại, nên link cần mở thẳng app Shopee" className="mb-3.5" />
          <HBars rows={data.devices} format={formatNumber} />
        </Card>
        <Card padded className="flex-[1_1_300px]">
          <CardHeader title="Theo khu vực" description="Ước lượng theo địa chỉ IP" className="mb-3.5" />
          <HBars rows={data.regions} format={formatNumber} />
        </Card>
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-[18px] pb-3">
          <div>
            <h2 className="text-[15px]">Link rút gọn</h2>
            <p className="text-[13px] text-muted">Mỗi bài đăng có một link riêng để biết bài nào hiệu quả</p>
          </div>
          <Segmented label="Lọc theo kênh">
            {FILTERS.map((f) => (
              <Segment key={f} href={`/app/links?${new URLSearchParams({ range: String(days), ...(f === "all" ? {} : { channel: f }) })}`} active={f === filter}>
                {f === "all" ? "Tất cả" : LINK_CHANNEL_LABEL[f]}
              </Segment>
            ))}
          </Segmented>
        </div>
        <TableScroll>
          <Table className="min-w-[900px]">
            <thead>
              <tr>
                <Th>Sản phẩm và link</Th>
                <Th>Kênh</Th>
                <Th align="right">Tự đếm</Th>
                <Th align="right">Sàn ghi nhận</Th>
                <Th align="right">Khớp</Th>
                <Th align="right">Đơn</Th>
                <Th align="right">Chuyển đổi</Th>
                <Th align="right">Bật</Th>
              </tr>
            </thead>
            <tbody>
              {links.length === 0 && (
                <tr>
                  <Td colSpan={8} className="text-muted">
                    Không có link nào ở kênh này.
                  </Td>
                </tr>
              )}
              {links.map((l) => (
                <Tr key={l.code} tone={l.enabled ? undefined : "dim"}>
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <ProductThumb id={l.deal.id} size={34} />
                      <div className="min-w-0">
                        <b className="font-medium">{l.deal.name}</b>
                        <div className="text-[13px]">
                          <Code subtle>{SHORT_DOMAIN.replace(/^https?:\/\//, "")}/{l.code}</Code>
                        </div>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <Badge tone={l.channel === "site" ? "neutral" : "fb"}>{LINK_CHANNEL_LABEL[l.channel]}</Badge>
                    <div className="mt-0.5 text-[13px] text-muted">{l.createdAt}</div>
                  </Td>
                  <Td align="right">
                    <b>{formatNumber(l.clicks)}</b>
                  </Td>
                  <Td align="right">{formatNumber(l.platformClicks)}</Td>
                  <Td align="right">
                    <span className={l.match !== null && l.match < 80 ? "font-medium text-warn" : undefined}>{l.match === null ? "—" : `${l.match}%`}</span>
                  </Td>
                  <Td align="right">{l.orders}</Td>
                  <Td align="right">{l.conversion === null ? "—" : formatPercent(l.conversion)}</Td>
                  <Td align="right">
                    <LinkControls code={l.code} url={`${SHORT_DOMAIN}/${l.code}`} enabled={l.enabled} />
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableScroll>
      </Card>

      <div className="flex flex-wrap items-stretch gap-4">
        <Card padded className="flex-[1_1_380px]">
          <CardHeader title="Lượt bị lọc" description="Không tính vào lượt bấm" className="mb-3" />
          <Table>
            <tbody>
              {data.filtered.map((f) => (
                <Tr key={f.label}>
                  <Td>
                    <b className="font-medium">{f.label}</b>
                    <div className="text-[13px] text-muted">
                      <Code>{f.detail}</Code>
                    </div>
                  </Td>
                  <Td align="right">{formatNumber(f.value)}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>
        <Card padded className="flex flex-[1_1_380px] flex-col gap-2.5">
          <CardHeader title="Cách đếm" />
          <div>
            <InfoRow label="Tên miền link">
              <Code>{SHORT_DOMAIN.replace(/^https?:\/\//, "")}</Code> <Badge tone="ok">Đang chạy</Badge>
            </InfoRow>
            <InfoRow label="Chuyển hướng">Cloudflare Workers, không đi qua máy chủ ứng dụng nên không tốn băng thông</InfoRow>
            <InfoRow label="Đồng bộ số liệu">Mỗi 15 phút. Số của sàn lấy theo báo cáo, thường trễ vài giờ</InfoRow>
            <InfoRow label="TikTok">Giỏ hàng TikTok không đi qua link rút gọn. Lượt bấm giỏ hàng chỉ xem được trong TikTok Shop trên app</InfoRow>
          </div>
        </Card>
      </div>
    </>
  );
}
