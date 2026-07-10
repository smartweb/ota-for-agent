import { createJsonRoute } from "@/lib/route-handler";
import { hotelOrderCreate } from "@/lib/order-api";
import type { HotelOrderCreateRequest } from "@/lib/order-types";

export const POST = createJsonRoute<HotelOrderCreateRequest>(
  async (body) => ({ data: await hotelOrderCreate(body) }),
  { errorDefaultMessage: "下单失败" }
);
