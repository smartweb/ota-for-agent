import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { SITE } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.title,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "AI Agent OTA",
    "AI 旅行",
    "AI 订机票",
    "AI 订酒店",
    "智能出行",
    "机票预订",
    "酒店预订",
    "城际巴士",
    "龙虾出行",
    "Longxa",
    "MCP 出行",
    "Agent 旅行平台",
  ],
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  applicationName: SITE.name,
  alternates: {
    canonical: SITE.url,
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: SITE.url,
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "travel",
};

export const viewport: Viewport = {
  themeColor: "#FF5A1F",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        {/* JSON-LD 结构化数据：帮助搜索引擎和 AI Agent 理解站点 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: SITE.name,
              url: SITE.url,
              description: SITE.description,
              potentialAction: {
                "@type": "SearchAction",
                target: `${SITE.url}/flight?from={query}`,
                query: "required",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-white text-neutral-900 font-sans antialiased">
        <Header />
        <main>{children}</main>
        <footer className="border-t border-neutral-200 mt-24">
          <div className="mx-auto max-w-6xl px-6 py-12">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-8">
              {/* 品牌 */}
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-brand-500 text-white text-xs font-bold">
                    龙
                  </span>
                  <span className="font-semibold">{SITE.name}</span>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  面向 AI Agent 的新一代出行平台。让大模型、智能助手和自动化 Agent 一键接入机票、酒店、巴士预订。
                </p>
              </div>

              {/* 产品 */}
              <FooterCol
                title="产品"
                links={[
                  { label: "机票搜索", href: "/flight" },
                  { label: "酒店预订", href: "/hotel" },
                  { label: "城际巴士", href: "/bus" },
                  { label: "我的订单", href: "/orders" },
                ]}
              />

              {/* 资源 */}
              <FooterCol
                title="资源"
                links={[
                  { label: "关于我们", href: "/about" },
                  { label: "技术博客", href: "/blog" },
                ]}
              />
            </div>

            <div className="pt-6 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-neutral-400">
              <span>© {new Date().getFullYear()} {SITE.name} · 面向 AI Agent 的 OTA 平台</span>
              <div className="flex items-center gap-4">
                <span>机票 · 酒店 · 巴士 · Agent API</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-3">{title}</h3>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <a
              href={l.href}
              className="text-xs text-neutral-500 hover:text-brand-600 transition"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
