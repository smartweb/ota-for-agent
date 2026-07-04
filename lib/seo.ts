/**
 * 站点级 SEO 配置，集中管理，便于全局引用。
 * 部署到 Vercel 后把 url 改成正式域名。
 */
export const SITE = {
  name: "龙虾出行",
  nameEn: "Longxa",
  url: "https://longxa.vercel.app",
  title: "龙虾出行 · 面向 AI Agent 的 OTA 平台 | 机票 · 酒店 · 巴士",
  description:
    "龙虾出行是面向 AI Agent 的新一代出行平台。通过语义化 API 和 MCP 协议，让大模型、智能助手和自动化 Agent 一键接入机票、酒店、城际巴士的搜索与预订，实现 AI 原生的出行规划。",
  twitter: "@longxa",
} as const;
