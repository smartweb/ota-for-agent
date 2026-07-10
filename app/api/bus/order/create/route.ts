import { createJsonRoute } from "@/lib/route-handler";
import { busOrderCreate } from "@/lib/order-api";
import type { BusCreateOrderRequest } from "@/lib/order-types";

/** POST /api/bus/order/create —— 创建巴士订单 */
export const POST = createJsonRoute<BusCreateOrderRequest>(
  async (body) => ({ data: await busOrderCreate(body) }),
  { errorDefaultMessage: "下单失败" }
);
