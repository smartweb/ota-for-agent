/**
 * 龙虾出行开放平台 - 服务端 API 客户端
 * 仅在 Next.js Route Handlers / Server Components 中使用，
 * Token 从环境变量读取，永不暴露给浏览器。
 */

import type {
  ApiResponse,
  FlightSearchRequest,
  FlightSearchResponse,
  HotelSearchRequest,
  HotelSearchResponse,
  BusSearchRequest,
  BusSearchResponse,
} from "./types";

const API_BASE =
  process.env.LONGXA_API_BASE || "https://api.longxiachuxing.com";

/** 业务类型 → 真实接口路径 */
const ENDPOINTS = {
  flight: "/open/v1/flight/search",
  hotel: "/open/v1/hotel/search",
  bus: "/open/v1/bus/search",
} as const;

export type BusinessType = keyof typeof ENDPOINTS;

export class ApiError extends Error {
  code: number;
  requestId?: string;
  constructor(message: string, code: number, requestId?: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.requestId = requestId;
  }
}

function getToken(): string {
  const token = process.env.LONGXA_API_TOKEN;
  if (!token) {
    throw new ApiError(
      "服务端未配置 LONGXA_API_TOKEN 环境变量",
      500
    );
  }
  return token;
}

/**
 * 通用调用封装：注入 Bearer Token，统一解包 { code, message, data }
 */
export async function callApi<T>(
  endpoint: string,
  body: Record<string, unknown>
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(body),
    // 平台侧可能较慢，给充足时间
    cache: "no-store",
  });

  let payload: ApiResponse<T>;
  try {
    payload = (await res.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError(
      `上游返回非 JSON（HTTP ${res.status}）`,
      res.status
    );
  }

  if (payload.code !== 0) {
    throw new ApiError(
      payload.message || `接口返回错误码 ${payload.code}`,
      payload.code,
      payload.request_id
    );
  }

  return payload.data as T;
}

export const flightSearch = (req: FlightSearchRequest) =>
  callApi<FlightSearchResponse>(ENDPOINTS.flight, req as unknown as Record<string, unknown>);

export const hotelSearch = (req: HotelSearchRequest) =>
  callApi<HotelSearchResponse>(ENDPOINTS.hotel, req as unknown as Record<string, unknown>);

export const busSearch = (req: BusSearchRequest) =>
  callApi<BusSearchResponse>(ENDPOINTS.bus, req as unknown as Record<string, unknown>);
