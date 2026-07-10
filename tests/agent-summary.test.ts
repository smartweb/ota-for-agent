/**
 * Agent summary / suggestions 生成测试。
 * 这些文案会直接念给最终用户（经 Agent），格式错误=误导用户。
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  flightSummary,
  flightRecommendReason,
  hotelSummary,
  busSummary,
  flightSuggestions,
  hotelSuggestions,
  busSuggestions,
} from "../lib/agentize.ts";
import type { FlightItem, HotelItem, BusItem } from "../lib/types.ts";

const baseFlight: FlightItem = {
  flight_id: "F1",
  flight_no: "MU5357",
  airline_code: "MU",
  airline_name: "东方航空",
  dep_airport_name: "虹桥国际机场",
  dep_city_name: "上海",
  arr_airport_name: "宝安国际机场",
  arr_city_name: "深圳",
  dep_time: "2026-08-01 08:00",
  arr_time: "2026-08-01 10:30",
  duration_minutes: 150,
  stop_count: 0,
  cabins: [
    {
      cabin_name: "经济舱",
      adult_price: 680,
      seat_status: "available",
    },
  ],
};

test("flightSummary: 直飞 + 时长", () => {
  const s = flightSummary(baseFlight);
  assert.match(s, /东方航空/);
  assert.match(s, /MU5357/);
  assert.match(s, /08:00/);
  assert.match(s, /10:30/);
  assert.match(s, /直飞/);
  assert.match(s, /2小时30分/);
});

test("flightSummary: 经停计入文案", () => {
  const s = flightSummary({ ...baseFlight, stop_count: 1 });
  assert.match(s, /经停1次/);
});

test("flightSummary: 缺字段不崩", () => {
  const s = flightSummary({} as FlightItem);
  assert.match(s, /未知航司/);
  assert.match(s, /直飞/); // stop_count 缺省=0 → 直飞
});

test("flightRecommendReason: 首条+直飞+余票紧张", () => {
  const few = {
    ...baseFlight,
    cabins: [{ ...baseFlight.cabins![0], seat_status: "few" as const }],
  };
  const r = flightRecommendReason(few, 0, 5);
  assert.match(r, /价格最低/);
  assert.match(r, /直飞省时/);
  assert.match(r, /余票紧张/);
});

test("flightRecommendReason: 非首条直飞 → 仍推荐直飞省时", () => {
  // baseFlight 是直飞（stop_count=0），即使非首条也应有"直飞省时"
  const r = flightRecommendReason(baseFlight, 2, 5);
  assert.match(r, /直飞省时/);
});

test("flightRecommendReason: 经停且非首条 → 兜底综合性价比", () => {
  const r = flightRecommendReason(
    { ...baseFlight, stop_count: 1 },
    2,
    5
  );
  assert.match(r, /综合性价比/);
});

test("hotelSummary: 完整字段", () => {
  const h: HotelItem = {
    hotel_name: "杭州大酒店",
    star_rating: 5,
    business_zone: "西湖",
    min_price: 388,
    review_score: 9.1,
    has_wifi: true,
    has_breakfast: true,
  } as HotelItem;
  const s = hotelSummary(h);
  assert.match(s, /杭州大酒店/);
  assert.match(s, /西湖/);
  assert.match(s, /¥388\/晚起/);
  assert.match(s, /9\.1/);
  assert.match(s, /WiFi/);
  assert.match(s, /早餐/);
});

test("hotelSummary: 价格缺失显示待定", () => {
  const s = hotelSummary({ hotel_name: "X酒店" } as HotelItem);
  assert.match(s, /价格待定/);
});

test("busSummary: 分转元 + 余票", () => {
  const b: BusItem = {
    class_name: "豪华大巴",
    start_station_name: "广州东站",
    end_station_name: "深圳福田",
    dep_time: "08:30",
    duration: 120,
    price: 4500, // 分
    avail_seat_count: 3,
  } as BusItem;
  const s = busSummary(b);
  assert.match(s, /豪华大巴/);
  assert.match(s, /08:30/);
  assert.match(s, /广州东站/);
  assert.match(s, /深圳福田/);
  assert.match(s, /¥45/); // 4500 分 = 45 元
  assert.match(s, /仅剩3张/);
});

test("busSummary: 售罄", () => {
  const b = { ...({} as BusItem), avail_seat_count: 0, price: 5000 };
  assert.match(busSummary(b), /已售罄/);
});

test("flightSuggestions: 有下一页", () => {
  const out = flightSuggestions(
    [baseFlight],
    { total: 30, page: 1, page_size: 20 },
    { from: "上海", to: "深圳", date: "2026-08-01" }
  );
  assert.ok(out.some((s) => s.action === "next_page"));
});

test("flightSuggestions: 无下一页不出现 next_page", () => {
  const out = flightSuggestions(
    [baseFlight],
    { total: 5, page: 1, page_size: 20 },
    {}
  );
  assert.ok(!out.some((s) => s.action === "next_page"));
});

test("hotelSuggestions: 有下一页", () => {
  const out = hotelSuggestions(
    [],
    { total: 50, page: 1, page_size: 20 },
    { city: "杭州" }
  );
  assert.ok(out.some((s) => s.action === "next_page"));
});

test("busSuggestions: 最便宜班次提示", () => {
  const buses: BusItem[] = [
    { price: 3000 } as BusItem,
    { price: 5000 } as BusItem,
  ];
  const out = busSuggestions(buses, { total: 2, page: 1, page_size: 20 }, {});
  const sortHint = out.find((s) => s.action === "sort_by");
  assert.ok(sortHint);
  assert.match(sortHint!.reason, /¥30/);
});
