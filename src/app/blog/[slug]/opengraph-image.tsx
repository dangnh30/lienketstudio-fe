import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";
import { getPost, getPosts } from "@/lib/data/posts";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = siteConfig.name;

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "linear-gradient(135deg, #0a0a0a 0%, #1f2937 100%)",
          color: "#fff",
        }}
      >
        <div style={{ fontSize: 32, opacity: 0.7 }}>{siteConfig.name}</div>
        <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.2 }}>
          {post?.title ?? siteConfig.name}
        </div>
        <div style={{ fontSize: 28, opacity: 0.6 }}>{new URL(siteConfig.url).host}</div>
      </div>
    ),
    size,
  );
}
