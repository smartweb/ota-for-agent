"use client";

import { useState } from "react";
import SearchTabs, { type TabKey } from "./SearchTabs";

const BACKGROUNDS: Record<TabKey, string> = {
  flight:
    "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=2000&q=80",
  hotel:
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=80",
  bus:
    "https://images.unsplash.com/photo-1473042904451-00171c69419d?auto=format&fit=crop&w=2000&q=80",
};

const TITLE: Record<TabKey, { small: string; big: string }> = {
  flight: { small: "翱翔云端", big: "飞向任何远方" },
  hotel: { small: "枕梦星河", big: "住进每座城市" },
  bus: { small: "穿山越岭", big: "一路皆是风景" },
};

export default function Hero() {
  const [tab, setTab] = useState<TabKey>("flight");
  const t = TITLE[tab];

  return (
    <section className="relative w-full h-[480px] md:h-[540px] overflow-hidden">
      {/* 底图：三层堆叠做淡入切换 */}
      <div className="absolute inset-0">
        {(Object.keys(BACKGROUNDS) as TabKey[]).map((k) => (
          <div
            key={k}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
            style={{
              backgroundImage: `url(${BACKGROUNDS[k]})`,
              opacity: k === tab ? 1 : 0,
            }}
          />
        ))}
        {/* 渐变遮罩：左侧暗，保证白字与搜索卡可读 */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/40 to-black/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      {/* 内容层 */}
      <div className="relative h-full mx-auto max-w-6xl px-6 flex items-center">
        <div className="w-full md:w-[480px]">
          {/* 标题 */}
          <div key={tab} className="mb-6 animate-[fadeIn_0.5s_ease-out]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-white/90 text-xs font-medium mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              {t.small}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.1] text-white drop-shadow-lg">
              {t.big}
            </h1>
          </div>

          {/* 搜索卡 */}
          <SearchTabs
            controlledTab={tab}
            onTabChange={setTab}
            variant="plain"
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
