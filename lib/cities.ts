/**
 * 热门机场 / 城市数据
 * - 机票用 IATA 三字码
 * - 巴士用 6 位行政区划代码（民政部标准），并附带市中心坐标
 *   （巴士接口实际要求 start_addr 或 start_lng+start_lat 提供一组）
 */

export interface AirportCity {
  /** 城市名 */
  city: string;
  /** IATA 三字码（机票用） */
  code: string;
  /** 所在省份 */
  province?: string;
  /** 主要机场名 */
  airport?: string;
}

export interface BusCity {
  /** 城市名 */
  city: string;
  /** 6 位行政区划代码（巴士用） */
  adcode: string;
  province?: string;
  /** 市中心经度 */
  lng?: number;
  /** 市中心纬度 */
  lat?: number;
  /** 市中心地标名（作为 start_addr 兜底） */
  addr?: string;
}

/* 机票热门城市（按航线密度选取） */
export const POPULAR_AIRPORTS: AirportCity[] = [
  { city: "北京", code: "BJS", province: "北京", airport: "首都/大兴国际机场" },
  { city: "上海", code: "SHA", province: "上海", airport: "虹桥/浦东国际机场" },
  { city: "广州", code: "CAN", province: "广东", airport: "白云国际机场" },
  { city: "深圳", code: "SZX", province: "广东", airport: "宝安国际机场" },
  { city: "成都", code: "CTU", province: "四川", airport: "天府/双流国际机场" },
  { city: "杭州", code: "HGH", province: "浙江", airport: "萧山国际机场" },
  { city: "西安", code: "XIY", province: "陕西", airport: "咸阳国际机场" },
  { city: "重庆", code: "CKG", province: "重庆", airport: "江北国际机场" },
  { city: "昆明", code: "KMG", province: "云南", airport: "长水国际机场" },
  { city: "厦门", code: "XMN", province: "福建", airport: "高崎国际机场" },
  { city: "南京", code: "NKG", province: "江苏", airport: "禄口国际机场" },
  { city: "武汉", code: "WUH", province: "湖北", airport: "天河国际机场" },
  { city: "长沙", code: "CSX", province: "湖南", airport: "黄花国际机场" },
  { city: "青岛", code: "TAO", province: "山东", airport: "胶东国际机场" },
  { city: "三亚", code: "SYX", province: "海南", airport: "凤凰国际机场" },
  { city: "海口", code: "HAK", province: "海南", airport: "美兰国际机场" },
  { city: "哈尔滨", code: "HRB", province: "黑龙江", airport: "太平国际机场" },
  { city: "大连", code: "DLC", province: "辽宁", airport: "周水子国际机场" },
];

/* 巴士热门城市（含行政区划代码 + 市中心坐标） */
export const POPULAR_BUS_CITIES: BusCity[] = [
  { city: "北京", adcode: "110100", province: "北京", lng: 116.4074, lat: 39.9042, addr: "北京市中心" },
  { city: "上海", adcode: "310100", province: "上海", lng: 121.4737, lat: 31.2304, addr: "上海市中心" },
  { city: "广州", adcode: "440100", province: "广东", lng: 113.2644, lat: 23.1291, addr: "广州市中心" },
  { city: "深圳", adcode: "440300", province: "广东", lng: 114.0579, lat: 22.5431, addr: "深圳市中心" },
  { city: "杭州", adcode: "330100", province: "浙江", lng: 120.1486, lat: 30.2741, addr: "杭州市中心" },
  { city: "南京", adcode: "320100", province: "江苏", lng: 118.7969, lat: 32.0603, addr: "南京市中心" },
  { city: "苏州", adcode: "320500", province: "江苏", lng: 120.5853, lat: 31.2989, addr: "苏州市中心" },
  { city: "武汉", adcode: "420100", province: "湖北", lng: 114.3055, lat: 30.5928, addr: "武汉市中心" },
  { city: "成都", adcode: "510100", province: "四川", lng: 104.0665, lat: 30.5728, addr: "成都市中心" },
  { city: "重庆", adcode: "500100", province: "重庆", lng: 106.5516, lat: 29.5630, addr: "重庆市中心" },
  { city: "西安", adcode: "610100", province: "陕西", lng: 108.9398, lat: 34.3416, addr: "西安市市中心" },
  { city: "郑州", adcode: "410100", province: "河南", lng: 113.6253, lat: 34.7466, addr: "郑州市中心" },
  { city: "长沙", adcode: "430100", province: "湖南", lng: 112.9388, lat: 28.2278, addr: "长沙市中心" },
  { city: "济南", adcode: "370100", province: "山东", lng: 117.1205, lat: 36.6510, addr: "济南市中心" },
  { city: "青岛", adcode: "370200", province: "山东", lng: 120.3826, lat: 36.0671, addr: "青岛市中心" },
  { city: "厦门", adcode: "350200", province: "福建", lng: 118.0894, lat: 24.4798, addr: "厦门市中心" },
  { city: "福州", adcode: "350100", province: "福建", lng: 119.2965, lat: 26.0745, addr: "福州市中心" },
  { city: "合肥", adcode: "340100", province: "安徽", lng: 117.2272, lat: 31.8206, addr: "合肥市中心" },
];

/**
 * 酒店首页「热门城市酒店」模块用：含经纬度，便于按 IP 定位结果就近匹配默认城市。
 * lng / lat 为城市中心点近似坐标。
 */
export interface HotelCity extends AirportCity {
  lng: number;
  lat: number;
}

export const POPULAR_HOTEL_CITIES: HotelCity[] = [
  { city: "北京", code: "BJS", province: "北京", airport: "首都/大兴国际机场", lng: 116.4074, lat: 39.9042 },
  { city: "上海", code: "SHA", province: "上海", airport: "虹桥/浦东国际机场", lng: 121.4737, lat: 31.2304 },
  { city: "广州", code: "CAN", province: "广东", airport: "白云国际机场", lng: 113.2644, lat: 23.1291 },
  { city: "深圳", code: "SZX", province: "广东", airport: "宝安国际机场", lng: 114.0579, lat: 22.5431 },
  { city: "成都", code: "CTU", province: "四川", airport: "天府/双流国际机场", lng: 104.0665, lat: 30.5728 },
  { city: "杭州", code: "HGH", province: "浙江", airport: "萧山国际机场", lng: 120.1486, lat: 30.2741 },
  { city: "武汉", code: "WUH", province: "湖北", airport: "天河国际机场", lng: 114.3055, lat: 30.5928 },
  { city: "西安", code: "XIY", province: "陕西", airport: "咸阳国际机场", lng: 108.9398, lat: 34.3416 },
  { city: "重庆", code: "CKG", province: "重庆", airport: "江北国际机场", lng: 106.5516, lat: 29.5630 },
  { city: "南京", code: "NKG", province: "江苏", airport: "禄口国际机场", lng: 118.7969, lat: 32.0603 },
  { city: "苏州", code: "SZV", province: "江苏", airport: "硕放国际机场", lng: 120.5853, lat: 31.2989 },
  { city: "天津", code: "TSN", province: "天津", airport: "滨海国际机场", lng: 117.1901, lat: 39.1252 },
  { city: "青岛", code: "TAO", province: "山东", airport: "胶东国际机场", lng: 120.3826, lat: 36.0671 },
  { city: "长沙", code: "CSX", province: "湖南", airport: "黄花国际机场", lng: 112.9388, lat: 28.2278 },
  { city: "厦门", code: "XMN", province: "福建", airport: "高崎国际机场", lng: 118.0894, lat: 24.4798 },
  { city: "昆明", code: "KMG", province: "云南", airport: "长水国际机场", lng: 102.7123, lat: 25.0406 },
];

/**
 * 经纬度算距离（km），用扁平 Earth 余弦近似，对城市级匹配足够。
 */
export function distanceKm(
  a: { lng: number; lat: number },
  b: { lng: number; lat: number }
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

/**
 * 国内优质酒店品牌（首页底部品牌推荐用）。
 * name 用于展示与 filters.hotel_brand 查询，desc 为一句标签，
 * gradient 用于无 logo 时的品牌色块，icon 为示意字符。
 */
export interface HotelBrand {
  name: string;
  desc: string;
  gradient: string;
  icon: string;
}

export const POPULAR_HOTEL_BRANDS: HotelBrand[] = [
  { name: "锦江", desc: "国民酒店 · 全国千店", gradient: "from-red-500 to-rose-600", icon: "锦" },
  { name: "华住", desc: "汉庭 · 全季 · 桔子", gradient: "from-orange-500 to-amber-600", icon: "华" },
  { name: "如家", desc: "经济舒适 · 商旅首选", gradient: "from-blue-500 to-indigo-600", icon: "如" },
  { name: "首旅", desc: "建国 · 京伦 · 和苑", gradient: "from-emerald-500 to-teal-600", icon: "首" },
  { name: "维也纳", desc: "中端商务 · 美食好眠", gradient: "from-amber-500 to-yellow-600", icon: "维" },
  { name: "亚朵", desc: "人文阅读 · IP 联名", gradient: "from-fuchsia-500 to-pink-600", icon: "亚" },
  { name: "希尔顿", desc: "国际豪华 · 荣誉客会", gradient: "from-sky-500 to-blue-700", icon: "希" },
  { name: "万豪", desc: "万豪 · JW · 丽思卡尔顿", gradient: "from-slate-700 to-neutral-900", icon: "万" },
];
