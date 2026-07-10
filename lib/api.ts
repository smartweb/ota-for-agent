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

/**
 * 上游请求超时（毫秒）。平台接口可能较慢，给到 30s；
 * 超过后主动中断，避免 Serverless 函数被永久挂起（Vercel 函数最长执行 10s~60s）。
 * 可用环境变量 LONGXA_API_TIMEOUT 覆盖。
 */
const API_TIMEOUT_MS = Number(process.env.LONGXA_API_TIMEOUT) || 30000;

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
 * 通用调用封装：注入 Bearer Token，统一解包 { code, message, data }。
 * 带 AbortController 超时保护，避免上游挂起导致函数永久阻塞。
 */
export async function callApi<T>(
  endpoint: string,
  body: Record<string, unknown>
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(body),
      // 平台侧可能较慢，且订单/价格需要实时性
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    if (err instanceof Error && err.name === "AbortError") {
      throw new ApiError(
        `上游响应超时（${API_TIMEOUT_MS / 1000}s）`,
        504,
        undefined
      );
    }
    // 网络层错误（DNS/连接拒绝等）
    throw new ApiError(
      `无法连接上游服务：${err instanceof Error ? err.message : "网络错误"}`,
      502
    );
  }
  clearTimeout(timer);

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
