/**
 * 浏览器定位 + 城市匹配的共享逻辑。
 * 结果缓存到 localStorage，全站复用。
 */

import {
  POPULAR_HOTEL_CITIES,
  distanceKm,
  type HotelCity,
} from "./cities";

export interface GeoLoc {
  lng: number;
  lat: number;
}

export const LOC_STORAGE_KEY = "longxa_user_geo";

/**
 * 浏览器地理定位（需用户授权），失败时返回 null（不再做 IP 兜底，
 * 因为品牌点击等场景需要"明确城市"，IP 兜底数据不可靠反而误导）。
 */
export function detectGeo(): Promise<GeoLoc | null> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lng: pos.coords.longitude, lat: pos.coords.latitude }),
      () => resolve(null),
      { timeout: 4000, maximumAge: 600000 }
    );
  });
}

/** 读取缓存的定位（同步），供点击场景即时取用 */
export function getCachedGeo(): GeoLoc | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LOC_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GeoLoc) : null;
  } catch {
    return null;
  }
}

/** 缓存定位到 localStorage */
export function cacheGeo(g: GeoLoc): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOC_STORAGE_KEY, JSON.stringify(g));
}

/**
 * 找出距离当前位置最近的城市名。
 * 找不到时回退到默认城市（上海）。
 */
export function nearestCityName(geo: GeoLoc | null, fallback = "上海"): string {
  if (!geo) return fallback;
  const sorted = [...POPULAR_HOTEL_CITIES].sort(
    (a, b) =>
      distanceKm(geo, { lng: a.lng, lat: a.lat }) -
      distanceKm(geo, { lng: b.lng, lat: b.lat })
  );
  return sorted[0]?.city || fallback;
}

/** 找出距离当前位置最近的 N 个城市 */
export function nearestCities(geo: GeoLoc | null, count: number): HotelCity[] {
  const base = POPULAR_HOTEL_CITIES;
  if (!geo) return base.slice(1, 1 + count);
  const sorted = [...base].sort(
    (a, b) =>
      distanceKm(geo, { lng: a.lng, lat: a.lat }) -
      distanceKm(geo, { lng: b.lng, lat: b.lat })
  );
  return sorted.slice(0, count);
}
