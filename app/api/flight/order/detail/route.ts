import { createJsonRoute } from "@/lib/route-handler";
import { flightOrderDetail } from "@/lib/order-api";

interface DetailBody {
  system_no?: string;
  out_trade_no?: string;
}

/** POST /api/flight/order/detail { system_no?, out_trade_no? } —— 机票订单详情 */
export const POST = createJsonRoute<DetailBody>(
  async (body) => {
    if (!body.system_no && !body.out_trade_no) {
      return { error: "需要 system_no 或 out_trade_no" };
    }
    return {
      data: await flightOrderDetail(body.system_no, body.out_trade_no),
    };
  },
  { errorDefaultMessage: "查询失败" }
);
