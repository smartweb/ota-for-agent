import { createJsonRoute } from "@/lib/route-handler";
import { flightPricing } from "@/lib/order-api";
import type { FlightPricingRequest } from "@/lib/order-types";

/** POST /api/flight/pricing —— 验价 */
export const POST = createJsonRoute<FlightPricingRequest>(
  async (body) => ({ data: await flightPricing(body) }),
  { errorDefaultMessage: "验价失败" }
);
