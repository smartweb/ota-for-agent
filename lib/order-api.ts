/**
 * 二期订单服务端客户端：pricing / rooms / order create/detail/list/cancel。
 * 复用 lib/api.ts 的鉴权与 callApi 机制。
 */

import { callApi, ApiError } from "./api";

export { ApiError };
import type {
  FlightPricingRequest,
  FlightPricingResponse,
  FlightOrderCreateRequest,
  FlightOrderCreateResponse,
  FlightOrderDetailResponse,
  FlightOrderListResponse,
  FlightOrderCancelResponse,
  HotelRoomsResponse,
  HotelOrderCreateRequest,
  HotelOrderCreateResponse,
  HotelOrderDetailResponse,
  HotelOrderListResponse,
  HotelOrderCancelResponse,
  BusPreOrderRequest,
  BusPreOrderResponse,
  BusCreateOrderRequest,
  BusCreateOrderResponse,
  BusOrderDetailResponse,
  BusOrderListResponse,
  BusOrderCancelResponse,
} from "./order-types";

const ENDPOINTS = {
  flightPricing: "/open/v1/flight/pricing",
  flightOrderCreate: "/open/v1/flight/order/create",
  flightOrderDetail: "/open/v1/flight/order/detail",
  flightOrderList: "/open/v1/flight/order/list",
  flightOrderCancel: "/open/v1/flight/order/cancel",
  hotelRooms: "/open/v1/hotel/rooms",
  hotelOrderCreate: "/open/v1/hotel/order/create",
  hotelOrderDetail: "/open/v1/hotel/order/detail", // GET + path 参数
  hotelOrderList: "/open/v1/hotel/order/list",
  hotelOrderCancel: "/open/v1/hotel/order/cancel",
  busOrderPre: "/open/v1/bus/order/pre",
  busOrderCreate: "/open/v1/bus/order/create",
  busOrderDetail: "/open/v1/bus/order/detail",
  busOrderList: "/open/v1/bus/order/list",
  busOrderCancel: "/open/v1/bus/order/cancel",
} as const;

/* ----------------------------- 机票 ----------------------------- */

export const flightPricing = (req: FlightPricingRequest) =>
  callApi<FlightPricingResponse>(ENDPOINTS.flightPricing, req as unknown as Record<string, unknown>);

export const flightOrderCreate = (req: FlightOrderCreateRequest) =>
  callApi<FlightOrderCreateResponse>(
    ENDPOINTS.flightOrderCreate,
    req as unknown as Record<string, unknown>
  );

export const flightOrderDetail = (systemNo?: string, outTradeNo?: string) =>
  callApi<FlightOrderDetailResponse>(ENDPOINTS.flightOrderDetail, {
    system_no: systemNo,
    out_trade_no: outTradeNo,
  });

export const flightOrderList = (params: Record<string, unknown> = {}) =>
  callApi<FlightOrderListResponse>(ENDPOINTS.flightOrderList, {
    page: 1,
    page_size: 20,
    ...params,
  });

export const flightOrderCancel = (systemNo: string, reason?: string) =>
  callApi<FlightOrderCancelResponse>(ENDPOINTS.flightOrderCancel, {
    system_no: systemNo,
    reason,
  });

/* ----------------------------- 酒店 ----------------------------- */

export const hotelRooms = (searchOfferId: string) =>
  callApi<HotelRoomsResponse>(ENDPOINTS.hotelRooms, {
    search_offer_id: searchOfferId,
  });

export const hotelOrderCreate = (req: HotelOrderCreateRequest) =>
  callApi<HotelOrderCreateResponse>(
    ENDPOINTS.hotelOrderCreate,
    req as unknown as Record<string, unknown>
  );

/** 酒店详情是 GET + path 参数，单独处理 */
export async function hotelOrderDetail(orderNo: string): Promise<HotelOrderDetailResponse> {
  const { ApiError } = await import("./api");
  const API_BASE =
    process.env.LONGXA_API_BASE || "https://api.longxiachuxing.com";
  const token = process.env.LONGXA_API_TOKEN;
  if (!token) throw new ApiError("服务端未配置 LONGXA_API_TOKEN", 500);

  const res = await fetch(`${API_BASE}${ENDPOINTS.hotelOrderDetail}/${orderNo}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  const payload = await res.json();
  if (payload.code !== 0) {
    throw new ApiError(payload.message || `错误码 ${payload.code}`, payload.code, payload.request_id);
  }
  return payload.data as HotelOrderDetailResponse;
}

export const hotelOrderList = (params: Record<string, unknown> = {}) =>
  callApi<HotelOrderListResponse>(ENDPOINTS.hotelOrderList, {
    page: 1,
    page_size: 20,
    ...params,
  });

export const hotelOrderCancel = (orderNo: string, cancelReason?: string) =>
  callApi<HotelOrderCancelResponse>(ENDPOINTS.hotelOrderCancel, {
    order_no: orderNo,
    cancel_reason: cancelReason,
  });

/* ----------------------------- 巴士 ----------------------------- */
// 订单号为 system_no（同机票），cancel 字段叫 reason（异酒店 cancel_reason）

export const busPreOrder = (req: BusPreOrderRequest) =>
  callApi<BusPreOrderResponse>(ENDPOINTS.busOrderPre, {
    ...req,
  });

export const busOrderCreate = (req: BusCreateOrderRequest) =>
  callApi<BusCreateOrderResponse>(ENDPOINTS.busOrderCreate, {
    ...req,
  });

export const busOrderDetail = (systemNo: string, outTradeNo?: string) =>
  callApi<BusOrderDetailResponse>(ENDPOINTS.busOrderDetail, {
    system_no: systemNo,
    out_trade_no: outTradeNo,
  });

export const busOrderList = (params: Record<string, unknown> = {}) =>
  callApi<BusOrderListResponse>(ENDPOINTS.busOrderList, {
    page: 1,
    page_size: 20,
    ...params,
  });

export const busOrderCancel = (systemNo: string, reason?: string) =>
  callApi<BusOrderCancelResponse>(ENDPOINTS.busOrderCancel, {
    system_no: systemNo,
    reason,
  });
