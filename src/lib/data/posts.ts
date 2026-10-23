import { cacheLife, cacheTag } from "next/cache";

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  publishedAt: string;
  updatedAt: string;
  author: string;
};

// Dữ liệu mẫu – thay bằng fetch tới API/CMS thật (giữ nguyên "use cache" + cacheTag).
const POSTS: Post[] = [
  {
    slug: "chao-mung-den-voi-lien-ket-studio",
    title: "Chào mừng đến với Liên Kết Studio",
    excerpt: "Giới thiệu về Liên Kết Studio và những gì chúng tôi làm.",
    content:
      "Đây là bài viết mẫu. Nội dung thật sẽ được lấy từ API/CMS và được cache bằng `use cache`, giúp hạn chế gọi backend và cho phép CDN cache HTML.",
    publishedAt: "2026-10-01T08:00:00.000Z",
    updatedAt: "2026-10-01T08:00:00.000Z",
    author: "Liên Kết Studio",
  },
  {
    slug: "toi-uu-seo-voi-nextjs",
    title: "Tối ưu SEO với Next.js",
    excerpt: "Metadata, sitemap, JSON-LD và cache CDN – nền tảng SEO kỹ thuật.",
    content:
      "Next.js hỗ trợ sẵn Metadata API, sitemap.xml, robots.txt và ảnh Open Graph động. Kết hợp prerender + CDN giúp TTFB thấp, cải thiện Core Web Vitals.",
    publishedAt: "2026-10-15T08:00:00.000Z",
    updatedAt: "2026-10-20T08:00:00.000Z",
    author: "Liên Kết Studio",
  },
];

/*
 * Ví dụ khi có API thật:
 *   const res = await fetch(`${process.env.API_URL}/posts`);
 *   return (await res.json()) as Post[];
 */

export async function getPosts(): Promise<Post[]> {
  "use cache";
  cacheLife("content");
  cacheTag("posts");

  return [...POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getPost(slug: string): Promise<Post | null> {
  "use cache";
  cacheLife("content");
  cacheTag("posts", `post:${slug}`);

  return POSTS.find((p) => p.slug === slug) ?? null;
}
