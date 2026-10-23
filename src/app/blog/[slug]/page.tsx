import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { JsonLd } from "@/components/json-ld";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { getPost, getPosts } from "@/lib/data/posts";

// Prerender toàn bộ bài viết lúc build => HTML tĩnh, CDN cache được
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return buildMetadata({ title: "Không tìm thấy bài viết", noIndex: true });

  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    type: "article",
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    // Ảnh OG lấy tự động từ opengraph-image.tsx cùng thư mục
  });
}

const dateFormatter = new Intl.DateTimeFormat("vi-VN", { dateStyle: "long", timeZone: "Asia/Ho_Chi_Minh" });

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const url = absoluteUrl(`/blog/${post.slug}`);
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      mainEntityOfPage: url,
      url,
      image: `${url}/opengraph-image`,
      inLanguage: siteConfig.language,
      author: { "@type": "Organization", name: post.author },
      publisher: { "@id": `${siteConfig.url}/#organization` },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Trang chủ", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Blog", item: absoluteUrl("/blog") },
        { "@type": "ListItem", position: 3, name: post.title, item: url },
      ],
    },
  ];

  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <JsonLd data={jsonLd} />
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-black/50 dark:text-white/50">
        <Link href="/" className="hover:underline">Trang chủ</Link>
        {" / "}
        <Link href="/blog" className="hover:underline">Blog</Link>
      </nav>
      <h1 className="mb-3 text-4xl font-bold tracking-tight">{post.title}</h1>
      <p className="mb-10 text-sm text-black/50 dark:text-white/50">
        {post.author} · <time dateTime={post.publishedAt}>{dateFormatter.format(new Date(post.publishedAt))}</time>
      </p>
      <div className="leading-relaxed">{post.content}</div>
    </article>
  );
}
