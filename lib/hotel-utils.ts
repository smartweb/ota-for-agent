/**
 * 酒店相关的小工具函数（纯函数，便于复用与测试）。
 */

/**
 * 评分 → 文案标签（参照 Booking.com 评分体系）。
 * 9+ 极佳 / 8+ 很好 / 7+ 好 / 6+ 还行 / <6
 */
export function reviewScoreLabel(score?: number): string {
  if (typeof score !== "number") return "暂无评分";
  if (score >= 9) return "极佳";
  if (score >= 8) return "很好";
  if (score >= 7) return "好";
  if (score >= 6) return "还行";
  return "一般";
}

/** 评分对应的色阶（amber 系） */
export function reviewScoreColor(score?: number): string {
  if (typeof score !== "number") return "text-neutral-400";
  if (score >= 9) return "text-emerald-600";
  if (score >= 8) return "text-amber-600";
  if (score >= 7) return "text-amber-500";
  return "text-neutral-500";
}

/**
 * distance_km → "距市中心 X.X km" 文案
 */
export function distanceLabel(km?: number): string {
  if (typeof km !== "number" || km <= 0) return "";
  if (km < 1) return `距市中心 ${Math.round(km * 1000)} m`;
  return `距市中心 ${km.toFixed(1)} km`;
}

/**
 * scene_tags 原始值（英文/拼音）→ 中文场景标签。
 * 数据里常见的取值粗略映射；未识别的会原样返回（去掉下划线）。
 */
const SCENE_LABEL: Record<string, string> = {
  couple: "情侣",
  family: "家庭",
  business: "商务",
  senior: "老年",
  inbound: "入境游",
  luxury: "豪华",
  budget: "经济",
};

export function sceneTagLabel(tag: string): string {
  const key = tag.toLowerCase().trim();
  if (SCENE_LABEL[key]) return SCENE_LABEL[key];
  return key.replace(/[_-]/g, " ");
}

/** 收藏 localStorage key */
export const HOTEL_FAVORITES_KEY = "hotel_favorites";

/** 读取收藏的 hotel_id 列表 */
export function readFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HOTEL_FAVORITES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

/** 写入收藏集合 */
export function writeFavorites(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HOTEL_FAVORITES_KEY, JSON.stringify(ids));
  } catch {
    // 忽略隐私模式异常
  }
}

/** 切换某个 hotel_id 的收藏状态，返回新数组 */
export function toggleFavorite(id: string): string[] {
  const cur = readFavorites();
  const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
  writeFavorites(next);
  return next;
}
