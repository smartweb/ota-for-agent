import Link from "next/link";

/**
 * 全站 404 页面：匹配品牌风格，并提供回到核心功能的入口。
 */
export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-6 py-20 text-center">
      <div className="text-5xl mb-4 opacity-60">🧭</div>
      <h1 className="text-2xl font-semibold mb-2">页面未找到</h1>
      <p className="text-sm text-neutral-500 mb-8">
        你访问的页面可能已下线或链接有误
      </p>
      <div className="flex gap-3 justify-center flex-wrap">
        <Link
          href="/"
          className="px-6 h-11 inline-flex items-center rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition"
        >
          返回首页
        </Link>
        <Link
          href="/flight"
          className="px-6 h-11 inline-flex items-center rounded-xl border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-50 transition"
        >
          搜机票
        </Link>
        <Link
          href="/orders"
          className="px-6 h-11 inline-flex items-center rounded-xl border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-50 transition"
        >
          我的订单
        </Link>
      </div>
    </div>
  );
}
