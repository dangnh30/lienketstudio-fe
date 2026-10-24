import { buildMetadata } from "@/shared/lib/seo";
import { Card } from "@/shared/ui/card";

export const metadata = buildMetadata({ title: "Chính sách bảo mật", description: "Lienket Studio thu thập, sử dụng và bảo vệ dữ liệu của bạn như thế nào.", path: "/bao-mat" });

export default function Page() {
  return (
    <article className="flex max-w-3xl flex-col gap-4 pt-4">
      <h1 className="text-[26px]">Chính sách bảo mật</h1>
      <p className="text-muted">Lienket Studio thu thập, sử dụng và bảo vệ dữ liệu của bạn như thế nào.</p>
      <Card padded className="text-muted">Nội dung đang được cập nhật.</Card>
    </article>
  );
}
