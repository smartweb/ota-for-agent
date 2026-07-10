/**
 * 订单本地索引（localStorage）测试。
 * 这层负责订单列表的完整性：去重、补丁更新、删除。
 * 用一个 mock localStorage 模拟浏览器环境。
 */
import { test, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import {
  getOrderIndex,
  addOrderIndex,
  removeOrderIndex,
  patchOrderIndex,
  findOrderByOrderNo,
  genOutTradeNo,
  type OrderIndexEntry,
} from "../lib/order-store.ts";

// ---- mock 全局 window + localStorage（order-store 依赖 window.localStorage）----
const store = new Map<string, string>();
const localStorageMock = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
};
const originalWindow = (globalThis as { window?: unknown }).window;

beforeEach(() => {
  store.clear();
  // order-store.ts 通过 window.localStorage 访问
  (globalThis as { window: { localStorage: typeof localStorageMock } }).window =
    { localStorage: localStorageMock };
});

after(() => {
  // 还原全局，避免影响其它测试文件
  (globalThis as { window?: unknown }).window = originalWindow;
});

const sample: OrderIndexEntry = {
  out_trade_no: "LXF1",
  order_no: "SYS1",
  type: "flight",
  created_at: 1000,
  title: "上海→深圳",
  amount: 680,
};

test("addOrderIndex: 新增条目出现在列表首位", () => {
  addOrderIndex(sample);
  const list = getOrderIndex();
  assert.equal(list.length, 1);
  assert.equal(list[0].out_trade_no, "LXF1");
});

test("addOrderIndex: 同 out_trade_no 去重，不会产生重复", () => {
  addOrderIndex(sample);
  addOrderIndex({ ...sample, title: "更新标题" });
  const list = getOrderIndex();
  assert.equal(list.length, 1);
  assert.equal(list[0].title, "更新标题");
});

test("addOrderIndex: 多条按倒序（最新在前）", () => {
  addOrderIndex({ ...sample, out_trade_no: "A", created_at: 1 });
  addOrderIndex({ ...sample, out_trade_no: "B", created_at: 2 });
  const list = getOrderIndex();
  assert.deepEqual(
    list.map((e) => e.out_trade_no),
    ["B", "A"]
  );
});

test("addOrderIndex: 最多保留 100 条", () => {
  for (let i = 0; i < 110; i++) {
    addOrderIndex({ ...sample, out_trade_no: `T${i}` });
  }
  assert.equal(getOrderIndex().length, 100);
});

test("removeOrderIndex: 删除指定条目", () => {
  addOrderIndex(sample);
  addOrderIndex({ ...sample, out_trade_no: "LXF2", order_no: "SYS2" });
  removeOrderIndex("LXF1");
  const list = getOrderIndex();
  assert.equal(list.length, 1);
  assert.equal(list[0].out_trade_no, "LXF2");
});

test("patchOrderIndex: 仅更新 amount/title，不动其他条目", () => {
  addOrderIndex(sample);
  addOrderIndex({ ...sample, out_trade_no: "LXF2", order_no: "SYS2" });
  const list = patchOrderIndex("LXF1", { amount: 999, title: "改后" });
  const target = list.find((e) => e.out_trade_no === "LXF1");
  assert.equal(target?.amount, 999);
  assert.equal(target?.title, "改后");
  // 另一条不受影响
  const other = list.find((e) => e.out_trade_no === "LXF2");
  assert.equal(other?.title, "上海→深圳");
});

test("patchOrderIndex: 不存在的条目不报错", () => {
  addOrderIndex(sample);
  const list = patchOrderIndex("NOPE", { amount: 1 });
  assert.equal(list.length, 1);
});

test("findOrderByOrderNo: 命中", () => {
  addOrderIndex(sample);
  assert.equal(findOrderByOrderNo("SYS1")?.out_trade_no, "LXF1");
});

test("findOrderByOrderNo: 未命中返回 undefined", () => {
  addOrderIndex(sample);
  assert.equal(findOrderByOrderNo("ZZZ"), undefined);
});

test("genOutTradeNo: 带业务前缀且唯一", () => {
  const f = genOutTradeNo("flight");
  const h = genOutTradeNo("hotel");
  const b = genOutTradeNo("bus");
  assert.match(f, /^LXF/);
  assert.match(h, /^LXH/);
  assert.match(b, /^LXB/);
  // 连续生成不重复
  const set = new Set([genOutTradeNo("flight"), genOutTradeNo("flight")]);
  assert.equal(set.size, 2);
});

test("getOrderIndex: JSON 损坏时返回空数组而非抛错", () => {
  store.set("longxa_orders", "{不是合法json");
  assert.deepEqual(getOrderIndex(), []);
});
