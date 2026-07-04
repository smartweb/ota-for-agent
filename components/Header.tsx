import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white font-bold text-sm shadow-sm transition-transform group-hover:scale-105">
            龙
          </span>
          <span className="text-[17px] font-semibold tracking-tight">
            龙虾出行
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2 text-sm">
          <HeaderLink href="/flight">机票</HeaderLink>
          <HeaderLink href="/hotel">酒店</HeaderLink>
          <HeaderLink href="/bus">巴士</HeaderLink>
          <span className="hidden sm:block w-px h-4 bg-neutral-200 mx-1" />
          <HeaderLink href="/blog">博客</HeaderLink>
          <HeaderLink href="/about">关于</HeaderLink>
          <HeaderLink href="/orders">订单</HeaderLink>
        </nav>
      </div>
    </header>
  );
}

function HeaderLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
    >
      {children}
    </Link>
  );
}
