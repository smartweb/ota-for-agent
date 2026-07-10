import { createJsonRoute } from "@/lib/route-handler";
import { busPreOrder } from "@/lib/order-api";
import type { BusPreOrderRequest } from "@/lib/order-types";

/** POST /api/bus/order/pre —— 预下单（询价） */
export const POST = createJsonRoute<BusPreOrderRequest>(
  async (body) => ({ data: await busPreOrder(body) }),
  { errorDefaultMessage: "询价失败" }
);
