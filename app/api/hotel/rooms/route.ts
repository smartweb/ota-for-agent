import { createJsonRoute } from "@/lib/route-handler";
import { hotelRooms } from "@/lib/order-api";

interface RoomsBody {
  search_offer_id?: string;
}

/** POST /api/hotel/rooms { search_offer_id } —— 查询酒店房型 */
export const POST = createJsonRoute<RoomsBody>(
  async (body) => {
    if (!body.search_offer_id) return { error: "需要 search_offer_id" };
    return { data: await hotelRooms(body.search_offer_id) };
  },
  { errorDefaultMessage: "查询房型失败" }
);
