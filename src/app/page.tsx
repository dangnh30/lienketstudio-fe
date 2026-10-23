import Link from "next/link";
import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { getPosts } from "@/lib/data/posts";

export const metadata = buildMetadata({ path: "/" });

export default async function HomePage() {
  const posts = await getPosts();

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <section className="mb-16">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">{siteConfig.name}</h1>
        <p className="max-w-2xl text-lg text-black/70 dark:text-white/70">
          {siteConfig.description}
        </p>
      </section>

      <section aria-labelledby="latest-posts">
        <h2 id="latest-posts" className="mb-6 text-2xl font-bold">
          Bài viết mới
        </h2>
        <ul className="grid gap-6 sm:grid-cols-2">
          {posts.map((post) => (
            <li key={post.slug} className="rounded-lg border border-black/10 p-6 dark:border-white/10">
              <h3 className="mb-2 text-lg font-medium">
                <Link href={`/blog/${post.slug}`} className="hover:underline">
                  {post.title}
                </Link>
              </h3>
              <p className="text-sm text-black/60 dark:text-white/60">{post.excerpt}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
