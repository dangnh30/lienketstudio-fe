import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

type BuildMetadataInput = {
  title?: string;
  description?: string;
  /** Đường dẫn tương đối, ví dụ "/blog/bai-viet" – dùng làm canonical */
  path?: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  noIndex?: boolean;
};

/** Tạo metadata chuẩn SEO (canonical, Open Graph, Twitter) cho từng trang. */
export function buildMetadata({
  title,
  description = siteConfig.description,
  path = "/",
  image,
  type = "website",
  publishedTime,
  modifiedTime,
  noIndex = false,
}: BuildMetadataInput = {}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      url: path,
      title: title ?? siteConfig.name,
      description,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      ...(image && { images: [{ url: image, width: 1200, height: 630 }] }),
      ...(type === "article" && { publishedTime, modifiedTime }),
    },
    twitter: {
      card: "summary_large_image",
      title: title ?? siteConfig.name,
      description,
      ...(image && { images: [image] }),
    },
    ...(noIndex && { robots: { index: false, follow: false } }),
  };
}

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}
