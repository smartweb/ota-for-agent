import { createJsonRoute } from "@/lib/route-handler";
import { hotelOrderCancel } from "@/lib/order-api";

interface CancelBody {
  order_no?: string;
  cancel_reason?: string;
}

/** POST /api/hotel/order/cancel { order_no, cancel_reason? } —— 取消酒店订单 */
export const POST = createJsonRoute<CancelBody>(
  async (body) => {
    if (!body.order_no) return { error: "需要 order_no" };
    return {
      data: await hotelOrderCancel(body.order_no, body.cancel_reason),
    };
  },
  { errorDefaultMessage: "取消失败" }
);
