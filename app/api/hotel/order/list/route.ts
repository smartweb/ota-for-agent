import { createJsonRoute } from "@/lib/route-handler";
import { hotelOrderList } from "@/lib/order-api";

/** POST /api/hotel/order/list [page,page_size,status] —— 酒店订单列表 */
export const POST = createJsonRoute<Record<string, unknown>>(
  async (body) => ({ data: await hotelOrderList(body) }),
  { allowEmptyBody: true, errorDefaultMessage: "查询失败" }
);
