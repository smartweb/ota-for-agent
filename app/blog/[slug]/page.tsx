import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { blogPosts, getPostBySlug } from "@/lib/blog-posts";
import { BlogContent } from "@/components/BlogContent";
import { SITE } from "@/lib/seo";

/** 静态生成所有文章页 */
export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

/** 每篇文章独立的 SEO metadata */
export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `${SITE.url}/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `${SITE.url}/blog/${post.slug}`,
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  // 上下篇导航
  const idx = blogPosts.findIndex((p) => p.slug === post.slug);
  const prev = idx > 0 ? blogPosts[idx - 1] : null;
  const next = idx < blogPosts.length - 1 ? blogPosts[idx + 1] : null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      {/* 面包屑 */}
      <nav className="text-xs text-neutral-400 mb-6">
        <Link href="/" className="hover:text-brand-600">首页</Link>
        <span className="mx-1.5">/</span>
        <Link href="/blog" className="hover:text-brand-600">博客</Link>
        <span className="mx-1.5">/</span>
        <span className="text-neutral-600">{post.title.slice(0, 12)}...</span>
      </nav>

      {/* 文章头 */}
      <header className="mb-10">
        <div className="flex items-center gap-3 text-xs text-neutral-400 mb-4">
          <time>{post.date}</time>
          <span>·</span>
          <span>{post.author}</span>
          <span>·</span>
          <span>{post.tags.join(" / ")}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-4">
          {post.title}
        </h1>
        <p className="text-lg text-neutral-600 leading-relaxed">
          {post.description}
        </p>
      </header>

      {/* 正文 */}
      <article>
        <BlogContent blocks={post.content} />
      </article>

      {/* 文章尾：CTA */}
      <div className="mt-12 rounded-2xl border border-brand-200 bg-brand-50/50 p-6 text-center">
        <h3 className="font-semibold text-brand-700 mb-1">体验 Agent 原生的出行预订</h3>
        <p className="text-sm text-neutral-600 mb-4">
          龙虾出行让 AI 助手一键接入机票、酒店、巴士预订
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/flight"
            className="px-5 h-10 inline-flex items-center rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition"
          >
            搜索机票
          </Link>
          <Link
            href="/about"
            className="px-5 h-10 inline-flex items-center rounded-xl border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-50 transition"
          >
            了解更多
          </Link>
        </div>
      </div>

      {/* 上下篇 */}
      <div className="mt-8 flex justify-between gap-4">
        {prev ? (
          <Link
            href={`/blog/${prev.slug}`}
            className="flex-1 rounded-xl border border-neutral-200 p-4 hover:border-brand-300 transition"
          >
            <div className="text-xs text-neutral-400 mb-1">← 上一篇</div>
            <div className="text-sm font-medium truncate">{prev.title}</div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
        {next ? (
          <Link
            href={`/blog/${next.slug}`}
            className="flex-1 rounded-xl border border-neutral-200 p-4 text-right hover:border-brand-300 transition"
          >
            <div className="text-xs text-neutral-400 mb-1">下一篇 →</div>
            <div className="text-sm font-medium truncate">{next.title}</div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </div>
  );
}
