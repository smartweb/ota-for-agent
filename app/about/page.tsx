import Link from "next/link";
import type { Metadata } from "next";
import { SITE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "关于我们",
  description:
    "龙虾出行是面向 AI Agent 的新一代出行平台。我们的使命是成为 AI 时代的出行基础设施，让机票、酒店、巴士的预订能力像水电一样，可以无缝接入任何智能设备和 AI 助手。",
  alternates: { canonical: `${SITE.url}/about` },
  openGraph: {
    title: "关于龙虾出行",
    description: "面向 AI Agent 的新一代出行平台",
    url: `${SITE.url}/about`,
  },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      {/* 头部 */}
      <section className="mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-medium mb-5">
          关于龙虾出行
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-5">
          让出行能力，
          <br />
          <span className="text-brand-500">像水电一样无处不在</span>
        </h1>
        <p className="text-lg text-neutral-600 leading-relaxed">
          龙虾出行是面向 AI Agent 的新一代出行平台。我们相信，在 AI 重塑一切的时代，出行的未来不只是更漂亮的搜索界面，而是让预订能力本身成为一种基础设施——任何智能设备、任何 AI 助手，都能在对话中自然地完成「订一张机票」「订一间酒店」。
        </p>
      </section>

      {/* 使命 */}
      <section className="mb-14">
        <h2 className="text-xl font-bold mb-4">我们的使命</h2>
        <div className="space-y-4 text-[15px] leading-7 text-neutral-700">
          <p>
            就像 Stripe 让支付能力无处不在一样，龙虾出行要让出行服务无缝可接入。我们为 AI 时代的所有智能体——大模型、智能助手、自动化 Agent、车载系统、智能音箱——提供统一的出行预订接口。
          </p>
          <p>
            通过语义化 API、MCP 协议和 llms.txt 标准，我们把机票、酒店、城际巴士的供应、验价、下单、支付全链路能力，封装成 AI 原生可调用的形态。用户只需对 AI 助手说一句话，剩下的交给 Agent 完成。
          </p>
        </div>
      </section>

      {/* 我们做什么 */}
      <section className="mb-14">
        <h2 className="text-xl font-bold mb-6">我们提供什么</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Capability
            icon="✈"
            title="全量出行供应"
            desc="聚合机票、酒店、城际巴士三大业务线，覆盖全国主要城市和航线，实时报价。"
          />
          <Capability
            icon="⌘"
            title="Agent 原生 API"
            desc="语义化参数、自然语言摘要、引导式建议，让 AI 助手开箱即用，无需读文档。"
          />
          <Capability
            icon="▲"
            title="MCP 标准接入"
            desc="基于 Model Context Protocol，Claude、Cursor、自建 Agent 一行配置即可接入。"
          />
        </div>
      </section>

      {/* 技术理念 */}
      <section className="mb-14">
        <h2 className="text-xl font-bold mb-4">技术理念</h2>
        <div className="space-y-3">
          <Principle
            num="01"
            title="机器可读优先"
            desc="从接口设计到内容产出，始终把「AI 能否理解和调用」作为第一优先级。"
          />
          <Principle
            num="02"
            title="语义而非编码"
            desc="用「上海」而非「SHA」，用「下周」而非「2026-08-01」，把领域复杂度留给服务端。"
          />
          <Principle
            num="03"
            title="引导而非猜测"
            desc="响应里带 suggestions，让 Agent 知道下一步该做什么，而不是盲目试探。"
          />
          <Principle
            num="04"
            title="开放标准"
            desc="拥抱 MCP、llms.txt、OpenAPI 等开放标准，不搞封闭生态。"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white p-8 text-center">
        <h2 className="text-xl font-bold mb-2">和我们一起构建 AI 出行的未来</h2>
        <p className="text-sm text-white/80 mb-6">
          无论你是想接入出行能力的开发者，还是对 AI Agent 感兴趣的技术人
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/flight"
            className="px-6 h-11 inline-flex items-center rounded-xl bg-white text-brand-600 text-sm font-semibold hover:bg-brand-50 transition"
          >
            立即体验
          </Link>
          <Link
            href="/blog"
            className="px-6 h-11 inline-flex items-center rounded-xl border border-white/40 text-white text-sm font-medium hover:bg-white/10 transition"
          >
            阅读技术博客
          </Link>
        </div>
      </section>
    </div>
  );
}

function Capability({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 p-5">
      <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center text-lg mb-3">
        {icon}
      </div>
      <h3 className="font-semibold text-sm mb-1.5">{title}</h3>
      <p className="text-xs text-neutral-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function Principle({
  num,
  title,
  desc,
}: {
  num: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-4 items-start">
      <span className="text-2xl font-bold text-brand-200 tabular-nums shrink-0">
        {num}
      </span>
      <div>
        <h3 className="font-semibold text-sm mb-0.5">{title}</h3>
        <p className="text-sm text-neutral-600 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
