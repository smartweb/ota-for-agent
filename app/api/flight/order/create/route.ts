import { createJsonRoute } from "@/lib/route-handler";
import { flightOrderCreate } from "@/lib/order-api";
import type { FlightOrderCreateRequest } from "@/lib/order-types";

export const POST = createJsonRoute<FlightOrderCreateRequest>(
  async (body) => ({ data: await flightOrderCreate(body) }),
  { errorDefaultMessage: "下单失败" }
);
