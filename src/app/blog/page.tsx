import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { getPosts } from "@/lib/data/posts";

export const metadata = buildMetadata({
  title: "Blog",
  description: "Tin tức, kiến thức và câu chuyện từ Liên Kết Studio.",
  path: "/blog",
});

const dateFormatter = new Intl.DateTimeFormat("vi-VN", { dateStyle: "long", timeZone: "Asia/Ho_Chi_Minh" });

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-10 text-3xl font-bold">Blog</h1>
      <ul className="space-y-10">
        {posts.map((post) => (
          <li key={post.slug}>
            <article>
              <h2 className="mb-1 text-xl font-medium">
                <Link href={`/blog/${post.slug}`} className="hover:underline">
                  {post.title}
                </Link>
              </h2>
              <time dateTime={post.publishedAt} className="text-sm text-black/50 dark:text-white/50">
                {dateFormatter.format(new Date(post.publishedAt))}
              </time>
              <p className="mt-2 text-black/70 dark:text-white/70">{post.excerpt}</p>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
