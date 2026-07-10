/**
 * 下单表单校验逻辑（纯函数，无 React 依赖，便于单测与复用）。
 * 从 components/order/OrderForms 中抽取，保持同名同签名，OrderForms 再 re-export。
 */
import type {
  PassengerInfo,
  GuestInfo,
  ContactInfo,
  BusPassenger,
} from "./order-types";

/** 机票乘客校验：姓名 / 证件号 / 11 位手机号。返回错误文案或 null。 */
export function validatePassengers(list: PassengerInfo[]): string | null {
  for (let i = 0; i < list.length; i++) {
    const p = list[i];
    if (!p.name.trim()) return `请填写乘客 ${i + 1} 的姓名`;
    if (!p.id_number.trim()) return `请填写乘客 ${i + 1} 的证件号`;
    if (!p.phone.trim() || p.phone.length !== 11) return `乘客 ${i + 1} 的手机号无效`;
  }
  return null;
}

/** 酒店入住人校验：仅姓名必填。 */
export function validateGuests(list: GuestInfo[]): string | null {
  for (let i = 0; i < list.length; i++) {
    if (!list[i].name.trim()) return `请填写入住人 ${i + 1} 的姓名`;
  }
  return null;
}

/** 联系人校验：姓名 + 11 位手机号。 */
export function validateContact(c: ContactInfo): string | null {
  if (!c.name.trim()) return "请填写联系人姓名";
  if (!c.phone.trim() || c.phone.length !== 11) return "联系人手机号无效";
  return null;
}

/** 巴士乘车人校验：姓名 / 11 位手机号 / 证件号。 */
export function validateBusPassengers(list: BusPassenger[]): string | null {
  for (let i = 0; i < list.length; i++) {
    const p = list[i];
    if (!p.name.trim()) return `请填写乘客 ${i + 1} 的姓名`;
    if (!p.phone.trim() || p.phone.length !== 11) return `乘客 ${i + 1} 的手机号无效`;
    if (!p.cert_no.trim()) return `请填写乘客 ${i + 1} 的证件号码`;
  }
  return null;
}
