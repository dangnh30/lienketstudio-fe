import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Badge, type BadgeTone } from "@/shared/ui/badge";
import { ButtonLink } from "@/shared/ui/button";
import { Card, CardHeader, Code } from "@/shared/ui/card";
import { PageHeader } from "@/shared/ui/page-header";
import { Table, Td, Th, Tr } from "@/shared/ui/table";
import { requireCustomer } from "@/server/auth/dal";
import { repositories } from "@/server/container";

export const metadata: Metadata = { title: "Kết nối và nguồn" };

function SourceCard({ name, status, tone, lines, action }: { name: string; status: string; tone: BadgeTone; lines: ReactNode[]; action?: ReactNode }) {
  return (
    <Card padded className="flex flex-col gap-1.5">
      <CardHeader title={name} action={<Badge tone={tone}>{status}</Badge>} />
      {lines.map((l, i) => (
        <div key={i} className="text-[13px] text-ink-2">
          {l}
        </div>
      ))}
      {action && <div className="mt-1.5">{action}</div>}
    </Card>
  );
}

const minutes = (m: number) => (m >= 60 && m % 60 === 0 ? `Mỗi ${m / 60} giờ` : `Mỗi ${m} phút`);

export default async function SourcesPage() {
  const { workspaceId } = await requireCustomer();
  const { accounts, workspaces } = repositories();
  const [a, workspace] = await Promise.all([accounts.get(workspaceId), workspaces.findById(workspaceId)]);
  if (!workspace) throw new Error("Workspace không tồn tại");
  const scan = workspace.scan;
  const canUpload = a.tiktok.connected && a.tiktok.canUpload;
  const connected = (on: boolean): [string, BadgeTone] => (on ? ["Đã kết nối", "ok"] : ["Chưa kết nối", "warn"]);

  return (
    <>
      <PageHeader title="Kết nối và nguồn" description="Chỉ dùng API chính thức; khóa lưu trong biến môi trường trên máy chủ" />

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[15px] text-muted">Nguồn dữ liệu</h2>
        <ButtonLink href="/app/accounts" size="sm">
          Quản lý tài khoản liên kết
        </ButtonLink>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3.5">
        <SourceCard
          name="AccessTrade"
          status={connected(a.accessTrade.connected)[0]}
          tone={connected(a.accessTrade.connected)[1]}
          lines={[
            "Shopee: datafeed, coupon, top bán chạy",
            <>TikTok Shop: <Code>/v2/tiktokshop_product_feeds</Code>, tạo link</>,
            `Giới hạn ${scan.accessTradeRatePerMinute} / 30 request mỗi phút`,
          ]}
        />
        <SourceCard
          name="Shopee Open API"
          status={connected(a.shopee.connected)[0]}
          tone={connected(a.shopee.connected)[1]}
          lines={[<><Code>productOfferV2</Code>, link rút gọn, báo cáo chuyển đổi</>]}
        />
      </div>

      <h2 className="text-[15px] text-muted">Kênh đăng</h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3.5">
        <SourceCard
          name="Facebook Page"
          status={connected(a.meta.connected)[0]}
          tone={connected(a.meta.connected)[1]}
          lines={[
            "Đăng tự động qua Pages API",
            a.meta.connected ? `${a.meta.pages.filter((p) => p.autoPost).length} Page bật đăng tự động` : "Chưa có Page nào",
          ]}
        />
        <SourceCard name="Facebook Group" status="Thủ công" tone="warn" lines={["Meta không còn API đăng vào Group", "Bài được soạn sẵn ở Lịch đăng"]} />
        <SourceCard
          name="TikTok"
          status="Bán tự động"
          tone={canUpload ? "ok" : "warn"}
          lines={[
            canUpload ? <>Có quyền <Code>video.upload</Code>: đẩy video vào hộp thư</> : <>Chưa có quyền <Code>video.upload</Code>: tải video về điện thoại</>,
            "Gắn giỏ hàng luôn làm trong app TikTok",
            a.tiktok.connected ? "Display API: đọc lượt xem video" : "Display API: chưa kết nối",
          ]}
        />
        <SourceCard
          name="Trang so sánh giá"
          status="Đang chạy"
          tone="ok"
          lines={["Trang tĩnh, cache qua CDN", "Dùng làm link bio TikTok, kéo người từ Google"]}
          action={
            <ButtonLink href="/" target="_blank" size="sm">
              Xem trang
            </ButtonLink>
          }
        />
      </div>

      <Card padded>
        <CardHeader title="Lịch quét theo tầng" action={<ButtonLink href="/app/settings/scan" size="sm">Chỉnh lịch quét</ButtonLink>} className="mb-2" />
        <Table>
          <thead>
            <tr>
              <Th>Tầng</Th>
              <Th>Gồm</Th>
              <Th>Tần suất</Th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Hàng nóng", "Sắp đăng, đang sale, giá đang biến động", minutes(scan.hotMinutes)],
              ["TikTok Shop", "Giá dao động theo livestream, flash sale", minutes(scan.tiktokMinutes)],
              ["Hàng thường", "Sản phẩm trong ngách", minutes(scan.normalMinutes)],
              ["Datafeed", "Tìm sản phẩm mới", `Hằng ngày ${scan.feedAt}`],
            ].map(([tier, desc, freq]) => (
              <Tr key={tier}>
                <Td>
                  <b>{tier}</b>
                </Td>
                <Td className="text-[13px]">{desc}</Td>
                <Td>{freq}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </>
  );
}
