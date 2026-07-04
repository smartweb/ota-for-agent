import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";
import { blogPosts } from "@/lib/blog-posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPages = [
    { url: "/", priority: 1, changeFreq: "daily" as const },
    { url: "/flight", priority: 0.9, changeFreq: "daily" as const },
    { url: "/hotel", priority: 0.9, changeFreq: "daily" as const },
    { url: "/bus", priority: 0.9, changeFreq: "daily" as const },
    { url: "/about", priority: 0.7, changeFreq: "monthly" as const },
    { url: "/blog", priority: 0.8, changeFreq: "weekly" as const },
    { url: "/orders", priority: 0.4, changeFreq: "daily" as const },
  ];

  return [
    ...staticPages.map((p) => ({
      url: `${SITE.url}${p.url}`,
      lastModified: now,
      changeFrequency: p.changeFreq,
      priority: p.priority,
    })),
    ...blogPosts.map((post) => ({
      url: `${SITE.url}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
