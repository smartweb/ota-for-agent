import { createJsonRoute } from "@/lib/route-handler";
import { flightOrderList } from "@/lib/order-api";

/** POST /api/flight/order/list [page,page_size,status] —— 机票订单列表 */
export const POST = createJsonRoute<Record<string, unknown>>(
  async (body) => ({ data: await flightOrderList(body) }),
  { allowEmptyBody: true, errorDefaultMessage: "查询失败" }
);
