/**
 * 表单校验函数测试。
 * 这些函数守护下单前最后一步，错了会直接导致无效订单提交或合法用户被拦。
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  validatePassengers,
  validateContact,
  validateGuests,
  validateBusPassengers,
} from "../lib/order-validation.ts";
import type {
  PassengerInfo,
  GuestInfo,
  ContactInfo,
  BusPassenger,
} from "../lib/order-types.ts";

const emptyPassenger = (): PassengerInfo => ({
  name: "",
  type: "adult",
  id_type: "ID_CARD",
  id_number: "",
  phone: "",
});
const emptyGuest = (): GuestInfo => ({ name: "" });
const emptyBusPassenger = (): BusPassenger => ({
  name: "",
  phone: "",
  cert_no: "",
  cert_type: 1,
  is_child: false,
});

test("validatePassengers: 空姓名报错", () => {
  const p = emptyPassenger();
  assert.equal(validatePassengers([p]), "请填写乘客 1 的姓名");
});

test("validatePassengers: 空证件号报错", () => {
  const p = { ...emptyPassenger(), name: "张三" };
  assert.equal(validatePassengers([p]), "请填写乘客 1 的证件号");
});

test("validatePassengers: 手机号不足 11 位报错", () => {
  const p = { ...emptyPassenger(), name: "张三", id_number: "110101199001011234" };
  // 手机号空
  assert.equal(validatePassengers([p]), "乘客 1 的手机号无效");
  // 手机号短
  p.phone = "1380000";
  assert.equal(validatePassengers([p]), "乘客 1 的手机号无效");
});

test("validatePassengers: 全部合法返回 null", () => {
  const p = {
    ...emptyPassenger(),
    name: "张三",
    id_number: "110101199001011234",
    phone: "13800001111",
  };
  assert.equal(validatePassengers([p]), null);
});

test("validatePassengers: 多乘客错误索引正确", () => {
  const ok = {
    ...emptyPassenger(),
    name: "李四",
    id_number: "110101199001011235",
    phone: "13900002222",
  };
  const bad = emptyPassenger(); // 第二个乘客空
  assert.equal(validatePassengers([ok, bad]), "请填写乘客 2 的姓名");
});

test("validatePassengers: 空数组视为合法（由上层保证至少一人）", () => {
  assert.equal(validatePassengers([]), null);
});

test("validateContact: 空姓名", () => {
  assert.equal(validateContact({ name: "", phone: "" }), "请填写联系人姓名");
});

test("validateContact: 手机号无效", () => {
  assert.equal(
    validateContact({ name: "王五", phone: "123" }),
    "联系人手机号无效"
  );
  assert.equal(
    validateContact({ name: "王五", phone: "" }),
    "联系人手机号无效"
  );
});

test("validateContact: 合法返回 null", () => {
  assert.equal(validateContact({ name: "王五", phone: "13800001111" }), null);
});

test("validateGuests: 空姓名报错", () => {
  assert.equal(validateGuests([emptyGuest()]), "请填写入住人 1 的姓名");
});

test("validateGuests: 合法返回 null", () => {
  assert.equal(validateGuests([{ name: "赵六" }]), null);
});

test("validateBusPassengers: 空姓名", () => {
  assert.equal(
    validateBusPassengers([emptyBusPassenger()]),
    "请填写乘客 1 的姓名"
  );
});

test("validateBusPassengers: 手机号不足 11 位", () => {
  const p = { ...emptyBusPassenger(), name: "钱七", cert_no: "110101199001011234" };
  assert.equal(validateBusPassengers([p]), "乘客 1 的手机号无效");
});

test("validateBusPassengers: 空证件号", () => {
  const p = {
    ...emptyBusPassenger(),
    name: "钱七",
    phone: "13800001111",
  };
  assert.equal(validateBusPassengers([p]), "请填写乘客 1 的证件号码");
});

test("validateBusPassengers: 合法返回 null", () => {
  const p = {
    ...emptyBusPassenger(),
    name: "钱七",
    phone: "13800001111",
    cert_no: "110101199001011234",
  };
  assert.equal(validateBusPassengers([p]), null);
});
