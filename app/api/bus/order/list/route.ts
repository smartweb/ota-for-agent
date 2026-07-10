import { createJsonRoute } from "@/lib/route-handler";
import { busOrderList } from "@/lib/order-api";

/** POST /api/bus/order/list [page,page_size,status] —— 巴士订单列表 */
export const POST = createJsonRoute<Record<string, unknown>>(
  async (body) => ({ data: await busOrderList(body) }),
  { allowEmptyBody: true, errorDefaultMessage: "查询订单列表失败" }
);
