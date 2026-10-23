import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Giới thiệu",
  description: `Tìm hiểu về ${siteConfig.name}: đội ngũ, giá trị và dịch vụ.`,
  path: "/gioi-thieu",
});

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-6 text-3xl font-bold">Giới thiệu</h1>
      <p className="leading-relaxed text-black/70 dark:text-white/70">
        {siteConfig.name} – nội dung giới thiệu sẽ được cập nhật.
      </p>
    </div>
  );
}
