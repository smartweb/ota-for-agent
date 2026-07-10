/**
 * 二期订单/支付相关 TypeScript 类型。
 * 对齐龙虾出行开放平台 pricing / rooms / order create/detail/list/cancel 接口。
 */

/* ----------------------------- 通用实体 ----------------------------- */

/** 证件类型枚举 */
export type IdType =
  | "ID_CARD"
  | "PASSPORT"
  | "HK_MACAO_PERMIT"
  | "RETURN_HOME_PERMIT"
  | "TAIWAN_PERMIT"
  | "TAIWAN_COMPATRIOT_PERMIT"
  | "SOLDIER_CARD"
  | "FOREIGN_PERMANENT_RESIDENCE_ID"
  | "HK_MACAO_TAIWAN_RESIDENCE_PERMIT"
  | "HOUSEHOLD_REGISTER"
  | "BIRTH_CERTIFICATE"
  | "OTHER";

/** 乘客类型 */
export type PassengerType = "adult" | "child" | "infant";

/** 乘客信息（机票） */
export interface PassengerInfo {
  name: string; // 中文姓名
  name_en?: string; // 英文姓名 ZHANG/SAN（国际必填）
  type: PassengerType;
  id_type: IdType;
  id_number: string;
  phone: string;
  sex?: 1 | 2; // 1男 2女
  birthday?: string; // YYYY-MM-DD（儿童/婴儿必填）
  nationality_code?: string; // CN（国际必填）
  card_valid_end_date?: string; // 证件有效期
}

/** 联系人信息 */
export interface ContactInfo {
  name: string;
  phone: string;
  email?: string;
}

/** 入住人信息（酒店，仅 name 必填） */
export interface GuestInfo {
  name: string;
  name_en?: string;
  id_type?: "ID_CARD" | "PASSPORT";
  id_number?: string;
}

/** 发票地址 */
export interface InvoiceAddress {
  province: string;
  city: string;
  district: string;
  detail_address: string;
  recipient_name: string;
  phone: string;
}

/** 支付模式 */
export type PayMode = "user_pay" | "enterprise_credit" | "monthly_settle";

/* ----------------------------- 机票：验价 ----------------------------- */

export interface FlightPricingRequest {
  search_offer_id: string;
  return_search_offer_id?: string;
  passengers: PassengerInfo[];
}

export interface PassengerFareItem {
  passenger_type?: string;
  base_fare?: number;
  airport_tax?: number;
  fuel_tax?: number;
  service_fee?: number;
  total?: number;
}

export interface FlightPricingResponse {
  offer_id: string;
  return_offer_id?: string;
  total_fare: number;
  price_changed?: boolean;
  expired_at?: string;
  baggage_rule?: string;
  refund_rule?: string;
  change_rule?: string;
  passenger_fares?: PassengerFareItem[];
}

/* ----------------------------- 机票：下单 ----------------------------- */

export interface FlightOrderCreateRequest {
  offer_id: string;
  return_offer_id?: string;
  passengers: PassengerInfo[];
  contact: ContactInfo;
  out_trade_no: string;
  pay_mode?: PayMode;
  return_url?: string;
  callback_url?: string;
  need_invoice?: boolean;
  invoice_address?: InvoiceAddress;
  external_user_id?: string;
  external_user_name?: string;
}

export interface FlightOrderCreateResponse {
  system_no: string;
  out_trade_no: string;
  status: string;
  total_amount: number;
  pay_mode?: string;
  pay_expire_time?: string;
  pnr?: string;
  checkout_url?: string;
  external_user_id?: string;
}

/* ----------------------------- 机票：详情 ----------------------------- */

export interface RefundRuleStage {
  time_node?: string;
  refund_fee?: number;
  refund_rate?: number;
  no_refund?: boolean;
  is_current?: boolean;
  is_past?: boolean;
}

export interface RefundRuleInfo {
  current?: {
    summary?: string;
    refund_fee?: number;
    refund_amount?: number;
    refund_rate?: number;
    time_node?: string;
  };
  stages?: RefundRuleStage[];
  text?: string;
}

export interface FlightOrderInfo {
  airline_name?: string;
  flight_no?: string;
  cabin_class?: string;
  dep_city?: string;
  dep_airport_name?: string;
  dep_terminal?: string;
  dep_time?: string;
  arr_city?: string;
  arr_airport_name?: string;
  arr_terminal?: string;
  arr_time?: string;
}

export interface FlightOrderDetailResponse {
  system_no: string;
  out_trade_no: string;
  status: string;
  status_text?: string;
  pay_status?: string;
  pay_status_text?: string;
  flight_status?: string;
  flight_status_text?: string;
  created_at?: string;
  paid_at?: string;
  issued_at?: string;
  total_amount?: number;
  pnr?: string;
  ticket_nos?: string[];
  contact?: ContactInfo;
  passengers?: PassengerInfo[];
  flight_info?: FlightOrderInfo;
  can_cancel?: boolean;
  can_refund?: boolean;
  estimated_refund_fee?: number;
  refund_amount?: number;
  refund_fee?: number;
  refund_rule?: RefundRuleInfo;
  /** 收银台 URL（待支付状态下返回） */
  checkout_url?: string;
  pay_expire_time?: string;
}

/* ----------------------------- 机票：列表/取消 ----------------------------- */

export interface FlightOrderListItem {
  system_no: string;
  out_trade_no: string;
  status: string;
  status_text?: string;
  pay_status?: string;
  flight_status?: string;
  flight_status_text?: string;
  airline?: string;
  flight_no?: string;
  cabin_class?: string;
  dep_city?: string;
  dep_airport_name?: string;
  dep_time?: string;
  arr_city?: string;
  arr_airport_name?: string;
  arr_time?: string;
  pnr?: string;
  created_at?: string;
  total_amount?: number;
}

export interface FlightOrderListResponse {
  orders: FlightOrderListItem[];
  total: number;
  page_info?: { page: number; page_size: number; total: number };
}

export interface FlightOrderCancelResponse {
  system_no: string;
  action: "cancel" | "refund";
  status: string;
  refund_fee?: number;
  refund_amount?: number;
  message?: string;
}

/* ----------------------------- 酒店：房型 ----------------------------- */

export interface HotelCancelPolicyRule {
  cancel_type?: number; // 0 不可取消 / 1 可取消
  desc?: string;
  move_up_cancel_days?: number;
  move_up_cancel_hour?: string;
  amount?: number;
  nights?: number;
  percent?: number;
}

export interface RoomTypeProduct {
  product_id: string;
  product_name: string;
  offer_id: string; // 下单用
  price: number;
  currency?: string;
  has_breakfast?: boolean;
  refundable?: boolean;
  cancel_policy?: string;
  cancel_policy_rules?: HotelCancelPolicyRule[];
}

export interface RoomType {
  room_type_id: string;
  room_name: string;
  bed_type?: string;
  area?: number;
  max_occupancy?: number;
  has_window?: boolean;
  facilities?: string[];
  products: RoomTypeProduct[];
}

export interface HotelRoomsResponse {
  hotel_id: string;
  hotel_name: string;
  check_in?: string;
  check_out?: string;
  room_types: RoomType[];
}

/* ----------------------------- 酒店：下单 ----------------------------- */

export interface HotelOrderCreateRequest {
  offer_id: string;
  out_trade_no: string;
  contact: ContactInfo;
  guests: GuestInfo[];
  pay_mode?: PayMode;
  return_url?: string;
  callback_url?: string;
  arrival_time?: string;
  special_request?: string;
  need_invoice?: boolean;
  invoice_address?: InvoiceAddress;
  external_user_id?: string;
}

export interface HotelOrderCreateResponse {
  order_no: string;
  out_trade_no: string;
  status: string;
  pay_mode?: string;
  total_amount: number;
  currency?: string;
  hotel_name?: string;
  room_name?: string;
  room_count?: number;
  check_in?: string;
  check_out?: string;
  nights?: number;
  created_at?: string;
  expires_at?: string;
  checkout_url?: string;
  external_user_id?: string;
}

/* ----------------------------- 酒店：详情/列表/取消 ----------------------------- */

export interface HotelCancelInfo {
  can_cancel?: boolean;
  cancellation_no?: string;
  refunded_amount?: number;
  refund_time?: string;
  cancel_policy_rules?: HotelCancelPolicyRule[];
}

export interface HotelOrderDetailResponse {
  order_no: string;
  out_trade_no: string;
  status: string;
  pay_status?: string;
  pay_mode?: string;
  hotel_name?: string;
  hotel_address?: string;
  hotel_phone?: string;
  hotel_status?: string;
  confirmation_no?: string;
  room_name?: string;
  room_count?: number;
  check_in?: string;
  check_out?: string;
  nights?: number;
  arrival_time?: string;
  guests?: GuestInfo[];
  contact?: ContactInfo;
  special_request?: string;
  total_amount?: number;
  currency?: string;
  created_at?: string;
  paid_at?: string;
  updated_at?: string;
  cancel_info?: HotelCancelInfo;
  /** 收银台 URL（待支付状态下返回） */
  checkout_url?: string;
  expires_at?: string;
}

export interface HotelOrderListItem {
  order_no: string;
  out_trade_no: string;
  status: string;
  pay_status?: string;
  hotel_status?: string;
  hotel_name?: string;
  room_name?: string;
  room_count?: number;
  guest_count?: number;
  check_in?: string;
  check_out?: string;
  arrival_time?: string;
  confirmation_no?: string;
  total_amount?: number;
  settle_amount?: number;
  created_at?: string;
  updated_at?: string;
}

export interface HotelOrderListResponse {
  orders: HotelOrderListItem[];
  page_info?: { page: number; page_size: number; total: number };
  total: number;
}

export interface HotelOrderCancelResponse {
  order_no: string;
  status: string;
  cancel_fee?: number;
  refund_amount?: number;
  refund_status?: string;
  cancelled_at?: string;
}

/* ----------------------------- 巴士 ----------------------------- */
// 对齐 /open/v1/bus/order/{pre,create,detail,list,cancel}
// 注意：巴士订单号字段为 system_no（同机票，异酒店 order_no）
//       创建订单 total_amount 单位为「分」，详情接口金额单位为「元」

/** 巴士乘客（实名） */
export interface BusPassenger {
  name: string;
  phone: string;
  cert_no: string;
  /** 证件类型：1=身份证 */
  cert_type?: number;
  /** 是否儿童票 */
  is_child?: boolean;
}

/** 预下单（询价）请求 */
export interface BusPreOrderRequest {
  /** 班次 GID（即 BusItem.gid） */
  line_class_day_gid: string;
  start_station_gid: string;
  end_station_gid: string;
  passengers: BusPassenger[];
}

/** 预下单（询价）响应 —— total_price 单位为元 */
export interface BusPreOrderResponse {
  total_price: number;
  passenger_count: number;
  avail_seat_count: number;
}

/** 创建订单请求 —— total_amount 单位为分（仅校验用） */
export interface BusCreateOrderRequest {
  line_class_day_gid: string;
  start_station_gid: string;
  end_station_gid: string;
  passengers: BusPassenger[];
  user_phone: string;
  out_trade_no: string;
  total_amount?: number;
  pay_mode?: "user_pay" | "enterprise_credit" | "monthly_settle";
  callback_url?: string;
  return_url?: string;
  external_user_id?: string;
  external_user_name?: string;
}

/** 创建订单响应 */
export interface BusCreateOrderResponse {
  /** 平台订单号 */
  system_no: string;
  out_trade_no: string;
  supplier_order_no?: string;
  /** 订单总金额（分） */
  total_amount: number;
  status: string;
  pay_expire_time?: string;
  /** 收银台 URL（user_pay 模式） */
  checkout_url?: string;
}

/** 车票（订单详情内） */
export interface BusTicket {
  ticket_id?: string;
  bar_code?: string;
  ticket_status?: string;
  ticket_type?: string;
  /** 实付金额（元） */
  pay_amount?: number;
  seat_no?: string;
  passenger_name?: string;
  passenger_cert_no?: string;
  passenger_phone?: string;
  is_child?: boolean;
  refund_status?: string;
  /** 退款金额（元） */
  refund_amount?: number;
}

/** 订单详情响应 —— 金额单位为「元」 */
export interface BusOrderDetailResponse {
  system_no: string;
  out_trade_no?: string;
  supplier_order_no?: string;
  status: string;
  supplier_status?: string;
  pay_status?: string;
  /** 订单总价（元） */
  total_amount?: number;
  /** 实付金额（元） */
  pay_amount?: number;
  /** 退款金额（元） */
  refund_amount?: number;
  contact_phone?: string;
  start_station_name?: string;
  end_station_name?: string;
  start_class_time?: string;
  end_class_time?: string;
  passengers?: BusPassenger[];
  tickets?: BusTicket[];
  created_at?: string;
  /** 收银台 URL（待支付状态下返回） */
  checkout_url?: string;
  pay_expire_time?: string;
}

/** 订单列表项 */
export interface BusOrderListItem extends BusOrderDetailResponse {}

/** 订单列表响应 */
export interface BusOrderListResponse {
  orders: BusOrderListItem[];
  page_info?: { page: number; page_size: number; total: number };
  total: number;
}

/** 取消订单响应 */
export interface BusOrderCancelResponse {
  system_no: string;
  status: string;
}
