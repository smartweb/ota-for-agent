import { createJsonRoute } from "@/lib/route-handler";
import { busOrderCancel } from "@/lib/order-api";

interface CancelBody {
  system_no?: string;
  reason?: string;
}

/** POST /api/bus/order/cancel { system_no, reason? } —— 取消巴士订单 */
export const POST = createJsonRoute<CancelBody>(
  async (body) => {
    if (!body.system_no) return { error: "需要 system_no" };
    return { data: await busOrderCancel(body.system_no, body.reason) };
  },
  { errorDefaultMessage: "取消订单失败" }
);
