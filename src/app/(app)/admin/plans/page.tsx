import type { Metadata } from "next";
import { formatNumber } from "@/shared/lib/format";
import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/ui/badge";
import { Card, InfoRow, Section } from "@/shared/ui/card";
import { PageHeader } from "@/shared/ui/page-header";
import { EditPlanButton } from "@/features/admin/components/admin-controls";
import { getPlans } from "@/features/admin/server/queries";

export const metadata: Metadata = { title: "Gói cước" };

export default async function PlansPage() {
  const { plans, trialDays } = await getPlans();
  return (
    <>
      <PageHeader title="Gói cước" description="Giới hạn của từng gói áp dụng ngay cho mọi khách đang dùng gói đó" />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-3.5">
        {plans.map((p) => (
          <Card key={p.id} className={cn("flex flex-col gap-1.5 p-[18px]", p.id === "pro" && "border-accent shadow-[0_0_0_1px_var(--color-accent)]")}>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-[15px]">{p.name}</h2>
              {!p.visible && <Badge>Đang ẩn</Badge>}
            </div>
            <div className="text-[26px] font-semibold tracking-[-0.02em] tnum">
              {formatNumber(p.price)}
              <small className="text-[13px] font-normal text-muted">₫{p.price ? " / tháng" : ""}</small>
            </div>
            <div className="text-[13px] text-muted">{p.customers} khách đang dùng</div>
            <ul className="mt-2 mb-3 flex flex-col">
              {[
                ["Ngách", p.niches],
                ["Sản phẩm theo dõi", formatNumber(p.products)],
                ["Bài Facebook mỗi ngày", p.fbPostsPerDay],
                ["Facebook Page", p.pages],
                ["Link rút gọn mỗi tháng", formatNumber(p.links)],
                ["Thành viên", p.members],
                ["Tự duyệt deal", p.autoApprove ? "Có" : "Không"],
              ].map(([label, value]) => (
                <li key={label} className="flex justify-between border-t border-line-2 py-[7px] text-[13.5px]">
                  <span className="text-muted">{label}</span>
                  <b className="font-medium tnum">{value}</b>
                </li>
              ))}
            </ul>
            <EditPlanButton plan={p} />
          </Card>
        ))}
      </div>
      <Section title="Quy tắc chung">
        <div>
          <InfoRow label="Dùng thử">{trialDays} ngày gói Chuyên nghiệp, không cần nhập phương thức thanh toán. Hết hạn tự chuyển về gói Miễn phí.</InfoRow>
          <InfoRow label="Vượt giới hạn">Ngừng theo dõi sản phẩm mới và ngừng đăng bài vượt mức, không xóa dữ liệu.</InfoRow>
          <InfoRow label="Quá hạn thanh toán">Nhắc vào ngày 1, 3 và 6. Sau 7 ngày tạm dừng đăng bài, sau 30 ngày chuyển về gói Miễn phí.</InfoRow>
        </div>
      </Section>
    </>
  );
}
