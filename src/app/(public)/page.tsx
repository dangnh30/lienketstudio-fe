import Link from "next/link";
import { offerOn } from "@/domain/deal";
import { siteConfig } from "@/shared/config/site";
import { formatVnd } from "@/shared/lib/format";
import { buildMetadata } from "@/shared/lib/seo";
import { ProductThumb } from "@/shared/ui/product-thumb";
import { CompareSearch } from "@/features/public-catalog/components/compare-search";
import { dealPath } from "@/features/public-catalog/seo";
import { getPopularDeals, getTrialDays } from "@/features/public-catalog/server/queries";
import { GuestOnly } from "@/features/public-catalog/components/account-actions";
import { ButtonLink } from "@/shared/ui/button";

export const metadata = buildMetadata({
  title: "Mua ở đâu rẻ nhất? So sánh giá Shopee, TikTok Shop và các website khác",
  description: siteConfig.description,
  path: "/",
});

const STEPS = [
  ["Dán link hoặc gõ tên", "Link dạng shopee.vn/… hoặc shp.ee/…"],
  ["Chọn nơi so sánh", "TikTok Shop, các website bán lẻ khác"],
  ["Xem nơi rẻ nhất", "Kèm lịch sử giá 90 ngày trên Shopee"],
] as const;

export default async function HomePage() {
  const [popular, trialDays] = await Promise.all([getPopularDeals(), getTrialDays()]);

  return (
    <>
      <section className="flex flex-col gap-3.5 pt-7 pb-1.5">
        <h1 className="text-[30px] tracking-[-0.02em] max-[640px]:text-2xl">Mua ở đâu rẻ nhất?</h1>
        <p className="text-muted">
          Dán link sản phẩm Shopee hoặc gõ tên. Hệ thống tìm cùng sản phẩm trên TikTok Shop và các website khác để bạn so giá.
        </p>
        <CompareSearch showResults />
        <ol className="mt-1.5 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-px overflow-hidden rounded-md border border-line bg-line">
          {STEPS.map(([title, note], i) => (
            <li key={title} className="flex flex-col gap-0.5 bg-white px-3.5 py-3 text-[13.5px]">
              <b>
                <span className="text-accent">{i + 1}. </span>
                {title}
              </b>
              <span className="text-[13px] text-muted">{note}</span>
            </li>
          ))}
        </ol>
      </section>

      {popular.length > 0 && (
        <section>
          <h2 className="mb-2.5 text-base">Đang được so sánh nhiều</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3">
            {popular.map((d) => (
              <Link key={d.id} href={dealPath(d)} className="flex items-center gap-2.5 rounded-md border border-line bg-white px-5 py-[18px] text-ink no-underline hover:border-[#d4d4d8]">
                <ProductThumb id={d.id} size={40} />
                <span className="min-w-0">
                  <b className="block font-medium">{d.name}</b>
                  <span className="text-[13px] text-muted tnum">Shopee {formatVnd(offerOn(d, "shopee")!.finalPrice)}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <GuestOnly>
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-line bg-white px-5 py-[18px]">
          <div className="flex-[1_1_320px]">
            <h2 className="text-[17px]">Bạn làm tiếp thị liên kết?</h2>
            <p className="mt-1 text-[13px] text-muted">
              Lienket Studio tự tìm deal giảm giá thật trên Shopee và TikTok Shop, soạn bài và đăng lên Facebook, theo dõi hoa hồng ở một nơi.
            </p>
          </div>
          <div className="flex gap-2">
            <ButtonLink href="/signup" variant="primary">
              Dùng thử {trialDays} ngày miễn phí
            </ButtonLink>
            <ButtonLink href="/login">Đăng nhập</ButtonLink>
          </div>
        </section>
      </GuestOnly>

      <p className="text-[13px] text-muted">{siteConfig.affiliateDisclosure}</p>
    </>
  );
}
