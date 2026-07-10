import { createJsonRoute } from "@/lib/route-handler";
import { busOrderDetail } from "@/lib/order-api";

interface DetailBody {
  system_no?: string;
  out_trade_no?: string;
}

/** POST /api/bus/order/detail { system_no?, out_trade_no? } —— 巴士订单详情 */
export const POST = createJsonRoute<DetailBody>(
  async (body) => {
    if (!body.system_no && !body.out_trade_no) {
      return { error: "需要 system_no 或 out_trade_no" };
    }
    return {
      data: await busOrderDetail(body.system_no || "", body.out_trade_no),
    };
  },
  { errorDefaultMessage: "查询订单失败" }
);
