"use client";

import { useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/flight", label: "机票" },
  { href: "/hotel", label: "酒店" },
  { href: "/bus", label: "巴士" },
  { href: "/blog", label: "博客" },
  { href: "/about", label: "关于" },
  { href: "/orders", label: "订单" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

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

        {/* 桌面导航 */}
        <nav className="hidden sm:flex items-center gap-1 sm:gap-2 text-sm">
          {NAV_LINKS.map((l) => (
            <HeaderLink key={l.href} href={l.href}>
              {l.label}
            </HeaderLink>
          ))}
        </nav>

        {/* 移动端汉堡按钮 */}
        <button
          type="button"
          aria-label="菜单"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="sm:hidden h-10 w-10 flex items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 transition"
        >
          {/* 简易汉堡图标，打开后变 ✕ */}
          <span className="text-xl leading-none">{open ? "✕" : "☰"}</span>
        </button>
      </div>

      {/* 移动端下拉菜单 */}
      {open && (
        <nav className="sm:hidden border-t border-neutral-200 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-2 flex flex-col">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-3 text-sm text-neutral-700 border-b border-neutral-100 last:border-0 hover:text-brand-600 transition"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
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
