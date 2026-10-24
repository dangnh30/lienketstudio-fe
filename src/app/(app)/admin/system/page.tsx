import type { Metadata } from "next";
import { requireAdmin } from "@/server/auth/dal";
import { Badge } from "@/shared/ui/badge";
import { Banner } from "@/shared/ui/banner";
import { ButtonLink } from "@/shared/ui/button";
import { Card, Section, Timeline } from "@/shared/ui/card";
import { MeterGrid } from "@/shared/ui/meter";
import { PageHeader } from "@/shared/ui/page-header";
import { ProgressBar } from "@/shared/ui/sparkline";
import { Table, TableScroll, Td, Th, Tr } from "@/shared/ui/table";

export const metadata: Metadata = { title: "Tình trạng hệ thống" };

/*
 * Bản mock: số liệu dịch vụ và tài nguyên là ví dụ theo thiết kế.
 * Bản thật đọc từ endpoint health của backend / hệ thống giám sát (Prometheus, Grafana...).
 */
const SERVICES = [
  ["API web", "Lienket.Api, phục vụ giao diện", "42 ms", "—"],
  ["Collector", "Quét giá cho 248 workspace", "10:41", "Hàng đợi 1.240 sản phẩm"],
  ["Scorer", "Chấm điểm, phát hiện giảm ảo", "10:41", "—"],
  ["Publisher", "Đăng Facebook Page, tạo gói TikTok", "10:40", "18 bài chờ trong 15 phút tới"],
  ["SiteGen", "Sinh trang so sánh giá", "10:30", "—"],
  ["Link Worker", "Chuyển hướng link rút gọn trên Cloudflare", "12 ms", "41.200 lượt hôm nay"],
  ["MongoDB", "Cơ sở dữ liệu chính", "—", "Dung lượng 14,2 GB"],
] as const;

const APIS = [
  ["AccessTrade", "Lấy sản phẩm, tạo link, báo cáo đơn", "0,4%", "Theo khóa của từng khách, 30 lượt/phút mỗi khóa", false],
  ["Shopee Open API", "Sản phẩm, link rút gọn, báo cáo", "0,1%", "Theo ứng dụng của từng khách", false],
  ["Meta Graph API", "Đăng bài lên Page", "2,8%", "Đã dùng 61% giới hạn theo giờ của ứng dụng", true],
  ["TikTok API", "Đọc lượt xem, đẩy video nháp", "0,6%", "Đã dùng 22% giới hạn ngày", false],
] as const;

const RESOURCES = [
  ["CPU", 38, 100, "%", "Trung bình 1 giờ qua"],
  ["RAM", 2.6, 4, "GB", "API, worker và hàng đợi"],
  ["Ổ đĩa", 14.2, 40, "GB", "MongoDB và nhật ký"],
  ["Băng thông ra", 62, 200, "GB", "Trang công khai đi qua Cloudflare"],
] as const;

export default async function SystemPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader
        title="Tình trạng hệ thống"
        description="Cập nhật lúc 10:42"
        actions={
          <ButtonLink href="/admin/audit" size="sm">
            Xem nhật ký
          </ButtonLink>
        }
      />
      <Banner tone="success">
        <b className="text-success">Mọi dịch vụ đang chạy bình thường.</b> Meta Graph API có tỷ lệ lỗi cao hơn thường lệ, hệ thống đang tự thử lại.
      </Banner>

      <Card>
        <div className="px-5 pt-[18px] pb-2.5">
          <h2 className="text-[15px]">Dịch vụ</h2>
        </div>
        <TableScroll>
          <Table className="min-w-[720px]">
            <thead>
              <tr>
                <Th>Dịch vụ</Th>
                <Th>Trạng thái</Th>
                <Th>Phản hồi hoặc lần chạy cuối</Th>
                <Th>Ghi chú</Th>
              </tr>
            </thead>
            <tbody>
              {SERVICES.map(([name, desc, last, note]) => (
                <Tr key={name}>
                  <Td>
                    <b className="font-medium">{name}</b>
                    <div className="text-[13px] text-muted">{desc}</div>
                  </Td>
                  <Td>
                    <Badge tone="ok">Đang chạy</Badge>
                  </Td>
                  <Td className="tnum">{last}</Td>
                  <Td className="text-[13px]">{note}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableScroll>
      </Card>

      <Card>
        <div className="px-5 pt-[18px] pb-2.5">
          <h2 className="text-[15px]">API bên ngoài</h2>
          <p className="text-[13px] text-muted">Tỷ lệ lỗi 24 giờ qua</p>
        </div>
        <TableScroll>
          <Table className="min-w-[720px]">
            <thead>
              <tr>
                <Th>Nền tảng</Th>
                <Th align="right">Tỷ lệ lỗi</Th>
                <Th>Giới hạn</Th>
              </tr>
            </thead>
            <tbody>
              {APIS.map(([name, desc, rate, limit, warn]) => (
                <Tr key={name}>
                  <Td>
                    <b className="font-medium">{name}</b>
                    <div className="text-[13px] text-muted">{desc}</div>
                  </Td>
                  <Td align="right">
                    <span className={warn ? "font-medium text-warn" : undefined}>{rate}</span>
                  </Td>
                  <Td className="text-[13px]">{limit}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableScroll>
      </Card>

      <Section title="Tài nguyên máy chủ" description="Bản SaaS cần lớn hơn máy e2-micro miễn phí: ví dụ 1 máy 2 vCPU, 4 GB cho API và worker, MongoDB Atlas riêng">
        <MeterGrid>
          {RESOURCES.map(([label, used, total, unit, note]) => {
            const pct = Math.round((used / total) * 100);
            return (
              <div key={label} className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[13px]">
                  <b>{label}</b>
                  <span className="tnum">
                    {String(used).replace(".", ",")} / {total} {unit}
                  </span>
                </div>
                <ProgressBar value={pct} tone={pct > 80 ? "warn" : "accent"} />
                <span className="text-[13px] text-muted">{note}</span>
              </div>
            );
          })}
        </MeterGrid>
      </Section>

      <Section title="Lỗi gần đây">
        <Timeline
          items={[
            { at: "10:38", text: "Meta Graph API trả lỗi 368 (tạm chặn vì spam) cho Page của Hoàng Ngọc Lan, đã tạm dừng Page này 1 giờ" },
            { at: "10:12", text: "AccessTrade trả 429 cho khóa của Ngô Tuấn Kiệt, thử lại sau 60 giây thành công" },
            { at: "09:47", text: "TikTok từ chối làm mới token của Lê Thu Hà, khách cần kết nối lại" },
            { at: "03:00", text: "Sao lưu MongoDB thành công, 2,1 GB, giữ 7 bản gần nhất" },
          ]}
        />
      </Section>
    </>
  );
}
