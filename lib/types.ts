/**
 * 龙虾出行开放平台 - TypeScript 类型定义
 * 字段对齐 /open/v1/{flight,hotel,bus}/search 三个接口的 OpenAPI spec
 */

/* ------------------------------------------------------------------ */
/* 统一响应包装                                                          */
/* ------------------------------------------------------------------ */

export interface ApiResponse<T> {
  /** 错误码，0 表示成功 */
  code: number;
  /** 错误信息（用户可读），成功为 "success" */
  message: string;
  /** 业务数据，失败时可能为 null */
  data: T;
  /** 请求 ID，全链路追踪 */
  request_id: string;
}

/* ------------------------------------------------------------------ */
/* 机票                                                                 */
/* ------------------------------------------------------------------ */

export interface FlightSearchRequest {
  /** 行程模式：domestic / international */
  trip_mode?: string;
  /** 行程类型：oneway / roundtrip */
  trip_type?: string;
  /** 出发城市/机场三字码，如 SHA */
  from_code?: string;
  /** 到达城市/机场三字码，如 SZX */
  to_code?: string;
  /** 舱位等级：economy / business / first */
  cabin_class?: string;
  /** 指定航班号 */
  flight_no?: string;
  /** 出发日期 YYYY-MM-DD */
  depart_date?: string;
  /** 乘客人数 */
  passengers?: {
    adult?: number;
    child?: number;
    infant?: number;
  };
  page_size?: number;
  /** 排序：price 等 */
  sort_by?: string;
}

export interface CabinFareItem {
  adult_price?: number; // 元
  airport_tax?: number; // 元
  baggage_rule?: string;
  cabin_class?: string;
  cabin_code?: string;
  cabin_name?: string;
  change_rule?: string;
  child_price?: number; // 元
  discount_rate?: number;
  fuel_tax?: number; // 元
  lowest_price?: number; // 元
  offer_id?: string;
  price_type?: "reference" | "realtime" | string;
  pricing_required?: boolean;
  refund_rule?: string;
  search_offer_id?: string;
  seat_status?: "enough" | "few" | "sold_out" | string;
}

export interface FlightItem {
  aircraft_type?: string;
  airline_code?: string;
  airline_name?: string;
  arr_airport_code?: string;
  arr_airport_name?: string;
  arr_city_code?: string;
  arr_city_name?: string;
  arr_terminal?: string;
  arr_time?: string; // "2026-06-01 10:30"
  cabins?: CabinFareItem[];
  dep_airport_code?: string;
  dep_airport_name?: string;
  dep_city_code?: string;
  dep_city_name?: string;
  dep_terminal?: string;
  dep_time?: string; // "2026-06-01 08:00"
  duration_minutes?: number;
  flight_id?: string;
  flight_no?: string;
  meal?: string;
  stop_count?: number;
}

export interface FlightSearchResponse {
  flights?: FlightItem[];
  return_flights?: FlightItem[];
  search_id?: string;
  tag?: string;
  total?: number;
  page?: number;
  page_size?: number;
}

/* ------------------------------------------------------------------ */
/* 酒店                                                                 */
/* ------------------------------------------------------------------ */

export interface HotelSearchFilters {
  has_wifi?: boolean;
  has_parking?: boolean;
  has_restaurant?: boolean;
  has_gymnasium?: boolean;
  has_swimming_pool?: boolean;
  has_child_facility?: boolean;
  star_levels?: number[];
  min_price?: number; // 元
  max_price?: number; // 元/晚
  min_review_score?: number; // 0-5
  hotel_brand?: string;
  max_distance_km?: number;
}

export interface HotelSearchRequest {
  /** 目的地关键词，如 "杭州西湖"（必填） */
  destination: string;
  /** 入住日期 YYYY-MM-DD（必填） */
  check_in: string;
  /** 离店日期 YYYY-MM-DD（必填） */
  check_out: string;
  adcode?: string;
  latitude?: number;
  longitude?: number;
  adult_count?: number;
  room_count?: number;
  /** 场景：couple / family / senior / business / inbound */
  scene?: string;
  /** 排序：best / price / rating / star / distance */
  sort_by?: string;
  filters?: HotelSearchFilters;
  page?: number;
  page_size?: number;
}

export interface HotelItem {
  hotel_id?: string;
  hotel_name?: string;
  hotel_name_en?: string;
  brand_name?: string;
  star_rating?: number;
  star_tag?: string;
  address?: string;
  city?: string;
  district?: string;
  business_zone?: string;
  latitude?: number;
  longitude?: number;
  distance_km?: number;
  min_price?: number; // 元/晚
  currency?: string;
  review_score?: number;
  review_count?: number;
  main_picture?: string;
  has_wifi?: boolean;
  has_parking?: boolean;
  has_swimming_pool?: boolean;
  has_breakfast?: boolean;
  scene_tags?: string[];
  search_offer_id?: string;
}

export interface PageInfo {
  page: number;
  page_size: number;
  total: number;
}

export interface HotelSearchResponse {
  hotels?: HotelItem[];
  page_info?: PageInfo;
  search_id?: string;
  total?: number;
}

/* ------------------------------------------------------------------ */
/* 巴士                                                                 */
/* ------------------------------------------------------------------ */

export interface BusSearchRequest {
  /** 出发城市代码（6位），如 440300（必填） */
  start_city_code: string;
  /** 到达城市代码（6位），如 440100（必填） */
  end_city_code: string;
  /** 出发日期 YYYY-MM-DD（必填） */
  date: string;
  start_addr?: string;
  start_lng?: number;
  start_lat?: number;
  end_addr?: string;
  end_lng?: number;
  end_lat?: number;
  /** 距离过滤：1（0-3km）/ 2（3-10km） */
  dist_type?: number;
  /** 排序：dep_time / price / distance */
  sort_by?: string;
  page?: number;
  page_size?: number;
}

export interface BusItem {
  line_gid?: string;
  /** 班次 GID（用于详情/下单） */
  gid?: string;
  line_name?: string;
  start_station_name?: string;
  end_station_name?: string;
  from_city?: string;
  to_city?: string;
  dep_date?: string;
  dep_time?: string; // "HH:MM"
  /** 票价，单位：分 */
  price?: number;
  duration?: number; // 分钟
  /** 总里程：文档标 km，实测为米，渲染时按 >200 视为米换算 */
  distance?: number;
  class_name?: string;
  seat_count?: number;
  avail_seat_count?: number;
  remark?: string;
  start_station_gid?: string;
  end_station_gid?: string;
  start_city_code?: string;
  end_city_code?: string;
}

export interface BusSearchResponse {
  total?: number;
  page_info?: PageInfo;
  lines?: BusItem[];
}
