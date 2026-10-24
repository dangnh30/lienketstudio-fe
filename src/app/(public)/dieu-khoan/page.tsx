import { buildMetadata } from "@/shared/lib/seo";
import { Card } from "@/shared/ui/card";

export const metadata = buildMetadata({ title: "Điều khoản sử dụng", description: "Các điều khoản khi sử dụng Lienket Studio và trang so sánh giá.", path: "/dieu-khoan" });

export default function Page() {
  return (
    <article className="flex max-w-3xl flex-col gap-4 pt-4">
      <h1 className="text-[26px]">Điều khoản sử dụng</h1>
      <p className="text-muted">Các điều khoản khi sử dụng Lienket Studio và trang so sánh giá.</p>
      <Card padded className="text-muted">Nội dung đang được cập nhật.</Card>
    </article>
  );
}
