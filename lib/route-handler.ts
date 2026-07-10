/**
 * 共享的 Route Handler 工具：消除 /api/* 路由里重复的
 * 「解析 JSON → 校验 → 调上游 → 统一错误包装」样板。
 *
 * 保持与既有路由完全一致的响应契约：
 *   成功 → { code: 0, message: "success", data }
 *   失败 → { code, message, data: null, request_id? }
 */
import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "./api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** 成功响应 */
export function jsonOk(data: unknown) {
  return NextResponse.json({ code: 0, message: "success", data });
}

/** 失败响应（业务错误） */
export function jsonFail(
  message: string,
  code = 400,
  status: number = code
) {
  return NextResponse.json(
    { code, message, data: null },
    { status }
  );
}

/** 把上游/内部错误映射为统一失败响应 */
export function apiErrorResponse(err: unknown, defaultMessage: string) {
  const e = err as ApiError;
  return NextResponse.json(
    {
      code: e?.code ?? 500,
      message: e?.message ?? defaultMessage,
      data: null,
      request_id: e?.requestId,
    },
    { status: 500 }
  );
}

/** 安全解析 JSON body；allowEmpty=true 时空 body 返回 {} */
export async function readJsonBody<T = Record<string, unknown>>(
  req: NextRequest,
  opts: { allowEmpty?: boolean } = {}
): Promise<{ ok: true; body: T } | { ok: false; response: NextResponse }> {
  try {
    const body = (await req.json()) as T;
    return { ok: true, body };
  } catch {
    if (opts.allowEmpty) {
      return { ok: true, body: {} as T };
    }
    return {
      ok: false,
      response: jsonFail("请求体不是合法 JSON", 400, 400),
    };
  }
}

/**
 * 高阶封装：把一个「接收 body、返回 {data} 或 {error}」的函数
 * 包成标准 POST handler，自动处理 JSON 解析与错误映射。
 *
 * 用法：
 *   export const POST = createJsonRoute(async (body) => {
 *     if (!body.system_no) return { error: "需要 system_no" };
 *     return { data: await flightOrderCancel(body.system_no, body.reason) };
 *   }, { errorDefaultMessage: "取消失败" });
 */
export function createJsonRoute<TBody = Record<string, unknown>>(
  handler: (body: TBody) => Promise<
    | { data: unknown }
    | { error: string; code?: number; status?: number }
  >,
  opts: {
    allowEmptyBody?: boolean;
    errorDefaultMessage?: string;
  } = {}
) {
  async function POST(req: NextRequest) {
    const parsed = await readJsonBody<TBody>(req, {
      allowEmpty: opts.allowEmptyBody,
    });
    if (!parsed.ok) return parsed.response;

    try {
      const result = await handler(parsed.body);
      if ("error" in result) {
        return jsonFail(result.error, result.code ?? 400, result.status ?? 400);
      }
      return jsonOk(result.data);
    } catch (err) {
      return apiErrorResponse(err, opts.errorDefaultMessage ?? "请求失败");
    }
  }

  // 暴露 Next.js 需要的路由配置
  (POST as unknown as { runtime: string; dynamic: string }).runtime = "nodejs";
  (POST as unknown as { runtime: string; dynamic: string }).dynamic =
    "force-dynamic";

  return POST;
}
