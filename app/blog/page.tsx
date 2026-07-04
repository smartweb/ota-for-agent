import Link from "next/link";
import type { Metadata } from "next";
import { blogPosts } from "@/lib/blog-posts";
import { SITE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "技术博客 · AI Agent 与出行的前沿探索",
  description:
    "龙虾出行技术博客，分享 AI Agent OTA、MCP 协议、语义化 API 设计、智能出行等话题的深度文章。",
  alternates: { canonical: `${SITE.url}/blog` },
  openGraph: {
    title: "技术博客 · 龙虾出行",
    description: "AI Agent 与出行的前沿探索",
    url: `${SITE.url}/blog`,
  },
};

export default function BlogListPage() {
  const posts = [...blogPosts].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-medium mb-4">
          龙虾出行 · 技术博客
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-3">
          AI Agent 与出行的前沿探索
        </h1>
        <p className="text-neutral-600 leading-relaxed">
          我们在构建面向 AI Agent 的新一代出行平台。这里分享关于 MCP 协议、语义化 API、智能旅行规划的技术思考和实践经验。
        </p>
      </header>

      <div className="space-y-6">
        {posts.map((post) => (
          <article
            key={post.slug}
            className="rounded-2xl border border-neutral-200 bg-white p-6 hover:border-brand-300 hover:shadow-hover transition-all"
          >
            <Link href={`/blog/${post.slug}`}>
              <div className="flex items-center gap-3 text-xs text-neutral-400 mb-2">
                <time>{post.date}</time>
                <span>·</span>
                <span>{post.author}</span>
              </div>
              <h2 className="text-lg font-semibold mb-2 hover:text-brand-600 transition">
                {post.title}
              </h2>
              <p className="text-sm text-neutral-600 leading-relaxed mb-3 line-clamp-2">
                {post.description}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-500 text-xs"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
