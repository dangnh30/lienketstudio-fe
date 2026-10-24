import { siteConfig } from "@/shared/config/site";
import { JsonLd } from "@/shared/ui/json-ld";
import { SiteBar, SiteFooter } from "@/features/public-catalog/components/site-bar";

/*
 * Khu công khai: prerender tĩnh, CDN cache (s-maxage), index được.
 * ensureStatic = "navigation": mọi trang con BẮT BUỘC tĩnh hoàn toàn – lỡ dùng cookies()/headers()
 * hay dữ liệu không cache thì build fail. Deal mới (ngoài generateStaticParams) được render tĩnh
 * ở lần truy cập đầu rồi lưu cache, bot luôn nhận HTML đầy đủ.
 */
export const ensureStatic = "navigation";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteConfig.url}/#organization`,
      name: siteConfig.name,
      url: siteConfig.url,
      logo: `${siteConfig.url}/icon.svg`,
      sameAs: siteConfig.social.map((s) => s.href),
    },
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      url: siteConfig.url,
      name: siteConfig.name,
      inLanguage: siteConfig.language,
      publisher: { "@id": `${siteConfig.url}/#organization` },
    },
  ],
};

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <JsonLd data={organizationJsonLd} />
      <SiteBar />
      <main className="mx-auto flex w-full max-w-[1080px] flex-1 flex-col gap-5 px-5 pt-6 pb-14">{children}</main>
      <SiteFooter />
    </div>
  );
}
