import { NextRequest } from "next/server";
import { hotelOrderDetail, ApiError } from "@/lib/order-api";
import { jsonOk, apiErrorResponse, jsonFail } from "@/lib/route-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/hotel/order/detail/[order_no] → 上游 GET /open/v1/hotel/order/detail/{order_no} */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const orderNo = params.id;
  if (!orderNo) return jsonFail("缺少 order_no", 400, 400);
  try {
    const data = await hotelOrderDetail(orderNo);
    return jsonOk(data);
  } catch (err) {
    const e = err as ApiError;
    return apiErrorResponse(e, "查询失败");
  }
}
