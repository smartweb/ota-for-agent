"use client";

import { useState } from "react";
import type {
  PassengerInfo,
  GuestInfo,
  ContactInfo,
  IdType,
  PassengerType,
} from "@/lib/order-types";

/* ----------------------------- 原子输入 ----------------------------- */

const inputCls =
  "h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-sm focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100 transition";

export function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-neutral-500">
        {label}
        {required && <span className="text-brand-500 ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}

export const TextInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={`${inputCls} ${props.className || ""}`} />
);

export const SelectInput = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...props} className={`${inputCls} ${props.className || ""} cursor-pointer`} />
);

const ID_TYPE_OPTIONS: { value: IdType; label: string }[] = [
  { value: "ID_CARD", label: "身份证" },
  { value: "PASSPORT", label: "护照" },
  { value: "HK_MACAO_PERMIT", label: "港澳通行证" },
  { value: "TAIWAN_COMPATRIOT_PERMIT", label: "台胞证" },
  { value: "OTHER", label: "其他" },
];

/* ----------------------------- 乘客表单（机票） ----------------------------- */

export function PassengerForm({
  index,
  value,
  onChange,
  onRemove,
  canRemove,
}: {
  index: number;
  value: PassengerInfo;
  onChange: (v: PassengerInfo) => void;
  onRemove?: () => void;
  canRemove?: boolean;
}) {
  const update = (patch: Partial<PassengerInfo>) => onChange({ ...value, ...patch });

  return (
    <div className="rounded-2xl border border-neutral-200 p-4 bg-white">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold">
          乘客 {index + 1}
          <span className="ml-2 text-xs text-neutral-400">
            {value.type === "adult" ? "成人" : value.type === "child" ? "儿童" : "婴儿"}
          </span>
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-neutral-400 hover:text-red-500 transition"
          >
            删除
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="姓名" required>
          <TextInput
            value={value.name}
            onChange={(e) => update({ name: e.target.value })}
            placeholder="与证件一致"
          />
        </Field>
        <Field label="乘客类型" required>
          <SelectInput
            value={value.type}
            onChange={(e) => update({ type: e.target.value as PassengerType })}
          >
            <option value="adult">成人</option>
            <option value="child">儿童</option>
            <option value="infant">婴儿</option>
          </SelectInput>
        </Field>
        <Field label="证件类型" required>
          <SelectInput
            value={value.id_type}
            onChange={(e) => update({ id_type: e.target.value as IdType })}
          >
            {ID_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="证件号码" required>
          <TextInput
            value={value.id_number}
            onChange={(e) => update({ id_number: e.target.value })}
            placeholder="证件号"
          />
        </Field>
        <Field label="手机号" required>
          <TextInput
            value={value.phone}
            onChange={(e) => update({ phone: e.target.value })}
            placeholder="11 位手机号"
            maxLength={11}
          />
        </Field>
      </div>
    </div>
  );
}

export function emptyPassenger(type: PassengerType = "adult"): PassengerInfo {
  return { name: "", type, id_type: "ID_CARD", id_number: "", phone: "" };
}

/* ----------------------------- 入住人表单（酒店） ----------------------------- */

export function GuestForm({
  index,
  value,
  onChange,
  onRemove,
  canRemove,
}: {
  index: number;
  value: GuestInfo;
  onChange: (v: GuestInfo) => void;
  onRemove?: () => void;
  canRemove?: boolean;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 p-3 bg-white">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-neutral-500">入住人 {index + 1}</span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-neutral-400 hover:text-red-500 transition"
          >
            删除
          </button>
        )}
      </div>
      <TextInput
        value={value.name}
        onChange={(e) => onChange({ ...value, name: e.target.value })}
        placeholder="入住人姓名"
      />
    </div>
  );
}

export function emptyGuest(): GuestInfo {
  return { name: "" };
}

/* ----------------------------- 联系人表单 ----------------------------- */

export function ContactForm({
  value,
  onChange,
}: {
  value: ContactInfo;
  onChange: (v: ContactInfo) => void;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 p-4 bg-white">
      <h3 className="text-sm font-semibold mb-3">联系人信息</h3>
      <div className="grid grid-cols-2 gap-3">
        <Field label="姓名" required>
          <TextInput
            value={value.name}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
            placeholder="联系人姓名"
          />
        </Field>
        <Field label="手机号" required>
          <TextInput
            value={value.phone}
            onChange={(e) => onChange({ ...value, phone: e.target.value })}
            placeholder="用于接收订单通知"
            maxLength={11}
          />
        </Field>
      </div>
    </div>
  );
}

/* ----------------------------- 表单校验 ----------------------------- */

export function validatePassengers(list: PassengerInfo[]): string | null {
  for (let i = 0; i < list.length; i++) {
    const p = list[i];
    if (!p.name.trim()) return `请填写乘客 ${i + 1} 的姓名`;
    if (!p.id_number.trim()) return `请填写乘客 ${i + 1} 的证件号`;
    if (!p.phone.trim() || p.phone.length !== 11) return `乘客 ${i + 1} 的手机号无效`;
  }
  return null;
}

export function validateGuests(list: GuestInfo[]): string | null {
  for (let i = 0; i < list.length; i++) {
    if (!list[i].name.trim()) return `请填写入住人 ${i + 1} 的姓名`;
  }
  return null;
}

export function validateContact(c: ContactInfo): string | null {
  if (!c.name.trim()) return "请填写联系人姓名";
  if (!c.phone.trim() || c.phone.length !== 11) return "联系人手机号无效";
  return null;
}
