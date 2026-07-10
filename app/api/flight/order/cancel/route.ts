import { createJsonRoute } from "@/lib/route-handler";
import { flightOrderCancel } from "@/lib/order-api";

interface CancelBody {
  system_no?: string;
  reason?: string;
}

/** POST /api/flight/order/cancel { system_no, reason? } —— 取消机票订单 */
export const POST = createJsonRoute<CancelBody>(
  async (body) => {
    if (!body.system_no) return { error: "需要 system_no" };
    return { data: await flightOrderCancel(body.system_no, body.reason) };
  },
  { errorDefaultMessage: "取消失败" }
);
