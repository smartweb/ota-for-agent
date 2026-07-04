/**
 * 博客文章数据（集中管理，便于 sitemap / 列表 / 详情共用）。
 * 每篇文章面向 SEO 关键词撰写，提升搜索引擎收录。
 */

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  keywords: string[];
  /** 正文：段落用对象数组表达，渲染成对应组件 */
  content: BlogBlock[];
}

export type BlogBlock =
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "quote"; text: string }
  | { type: "code"; lang?: string; text: string };

export const blogPosts: BlogPost[] = [
  /* ----------------------------- 文章 1 ----------------------------- */
  {
    slug: "what-is-ai-agent-ota",
    title: "什么是面向 AI Agent 的 OTA？下一代旅行平台的新范式",
    description:
      "AI Agent OTA 正在改变我们规划出行的方式。本文解释什么是 Agent 友好的旅行平台、它与传统 OTA 的区别，以及 MCP 协议和语义化 API 如何让大模型直接帮用户订机票、订酒店。",
    date: "2026-07-02",
    author: "龙虾出行技术团队",
    tags: ["AI Agent", "OTA", "MCP", "旅行科技"],
    keywords: [
      "AI Agent OTA",
      "AI 订机票",
      "AI 订酒店",
      "MCP 旅行",
      "智能出行平台",
      "大模型订票",
    ],
    content: [
      { type: "p", text: "过去十年，在线旅行平台（OTA）的交互范式一直是「人点击屏幕」：用户打开 App，选择出发地、目的地、日期，浏览列表，比较价格，最终下单。这个范式在 2026 年正在被一种新形态打破——面向 AI Agent 的 OTA。" },
      { type: "h2", text: "传统 OTA 的瓶颈" },
      { type: "p", text: "传统 OTA 是为人类的眼睛和手指设计的。它的界面华丽、信息密集，但对机器非常不友好。一个想帮你订机票的 AI 助手，面对传统的 HTML 列表页几乎无能为力——它无法可靠地从渲染后的 DOM 里提取价格、时刻和舱位信息。" },
      { type: "p", text: "更根本的问题是，传统 API 是为开发者设计的，不是为 AI 设计的。参数名晦涩、错误信息含糊、响应结构需要大量领域知识才能解读。Agent 调用后，还要自己组织语言向用户解释结果。" },
      { type: "h2", text: "什么是面向 AI Agent 的 OTA" },
      { type: "p", text: "面向 AI Agent 的 OTA 从底层就为「机器可读、机器可调用」而构建。它有三个核心特征：" },
      { type: "ul", items: [
        "语义化 API：参数和响应都用自然语言描述，Agent 能直接理解「什么时候该用哪个接口」",
        "自描述能力：每条结果都带 summary 字段，Agent 不用自己组织语言，直接念给用户即可",
        "引导式交互：响应里带 suggestions，告诉 Agent 下一步可以做什么（翻页、筛选、下单）",
      ]},
      { type: "h2", text: "MCP 协议：Agent 接入的标准化" },
      { type: "p", text: "Model Context Protocol（MCP）是让 AI Agent 接入外部能力的标准化协议。一个 Agent 友好的 OTA 会把搜索能力封装成 MCP Server，Claude Desktop、Cursor、自建 Agent 都可以「插上即用」，不用读 API 文档。" },
      { type: "p", text: "用户在对话里说「下周去上海出差，帮我查机票和酒店」，Agent 会自动调用机票搜索和酒店搜索两个工具，把结果整合后给出推荐。整个过程用户不需要打开任何网页。" },
      { type: "h2", text: "龙虾出行的实践" },
      { type: "p", text: "龙虾出行正是这一新范式的实践者。我们的开放平台定位为「AI 时代的出行基础设施」，对外暴露语义化 API，每条航班、每家酒店都带自然语言摘要，并通过 llms.txt 让 Agent 一眼读懂我们的能力边界。" },
      { type: "p", text: "这不是给传统 OTA 加一个聊天框，而是从接口层重新设计——让出行能力像水电一样，可以无缝接入任何智能设备、任何 AI 助手。" },
    ],
  },

  /* ----------------------------- 文章 2 ----------------------------- */
  {
    slug: "mcp-travel-integration-guide",
    title: "如何用 MCP 协议让 AI 助手帮你订机票：开发者集成指南",
    description:
      "手把手教你用 Model Context Protocol（MCP）把出行预订能力接入 Claude Desktop、Cursor 等 AI 助手。涵盖 MCP Server 搭建、工具定义、搜索与下单全流程示例代码。",
    date: "2026-07-04",
    author: "龙虾出行技术团队",
    tags: ["MCP", "开发指南", "AI 集成", "TypeScript"],
    keywords: [
      "MCP 订机票",
      "MCP Server 教程",
      "Claude 订票",
      "AI 助手订机票",
      "Model Context Protocol 旅行",
      "MCP 开发指南",
    ],
    content: [
      { type: "p", text: "Model Context Protocol（MCP）正在成为 AI Agent 接入外部能力的事实标准。本文以龙虾出行为例，演示如何把机票搜索封装成 MCP Server，让 Claude Desktop 这样的 AI 助手直接帮你查票、订票。" },
      { type: "h2", text: "为什么用 MCP 而不是直接调 API" },
      { type: "p", text: "直接给 Agent 一个 REST API 文档，它需要自己理解参数含义、处理错误、组织调用顺序。而 MCP 把这些能力封装成「工具（Tool）」，每个工具有清晰的描述和参数 Schema，Agent 看到工具定义就知道怎么用。" },
      { type: "p", text: "对用户来说，这意味着你只需在 Claude 里说「查一下明天上海到深圳的机票」，它会自动调用你配置好的 MCP 工具，无需你写任何提示词模板。" },
      { type: "h2", text: "定义机票搜索工具" },
      { type: "p", text: "一个 MCP 工具的核心是它的 name、description 和 inputSchema。description 要写清楚「什么场景该用这个工具」：" },
      { type: "code", lang: "typescript", text: `{
  name: "search_flights",
  description: "搜索机票。用户提到'机票/航班/飞/出发去某地'时使用",
  inputSchema: {
    type: "object",
    properties: {
      from: { type: "string", description: "出发城市，如'上海'" },
      to: { type: "string", description: "到达城市，如'深圳'" },
      date: { type: "string", description: "YYYY-MM-DD" }
    },
    required: ["from", "to", "date"]
  }
}` },
      { type: "p", text: "注意 description 里写了「用户提到'机票/航班/飞'时使用」——这帮助 Agent 在对话中正确识别何时调用这个工具，而不是在用户聊酒店时误调。" },
      { type: "h2", text: "让响应对 Agent 友好" },
      { type: "p", text: "工具返回的结果要便于 Agent 理解和转述。龙虾出行的语义化 API 给每条航班都带了 summary 字段：" },
      { type: "code", lang: "json", text: `{
  "flight_no": "MU5357",
  "summary": "东方航空 MU5357，上海 20:30 出发，23:00 到达深圳，直飞，飞行2小时30分",
  "recommend_reason": "当前列表价格最低，直飞省时",
  "quick_facts": { "price": 450, "direct": true }
}` },
      { type: "p", text: "Agent 拿到这个响应后，可以直接把 summary 念给用户，再附上 recommend_reason 解释为什么推荐这条。用户问「最便宜的是哪个」，Agent 也能从 quick_facts 里秒定位。" },
      { type: "h2", text: "在 Claude Desktop 里接入" },
      { type: "p", text: "配置 MCP Server 后，在 Claude Desktop 的设置文件里加上你的 Server 地址，重启即可。之后在对话中，Claude 会自动识别出行相关的意图，调用搜索工具，把结果用自然语言反馈给你。" },
      { type: "p", text: "完整的下单闭环（搜索→验价→下单→支付）也可以封装成 MCP 工具链。Agent 按顺序调用，用户只需在对话里确认乘客信息，Agent 自动完成验价和下单，最后返回收银台链接。" },
      { type: "quote", text: "MCP 的价值不在于「让 AI 能调 API」，而在于「让 AI 在正确的时机、用正确的方式、调正确的接口」。语义化的工具定义是这一切的基础。" },
    ],
  },

  /* ----------------------------- 文章 3 ----------------------------- */
  {
    slug: "semantic-api-design-for-agents",
    title: "语义化 API 设计：让大模型秒懂你的接口",
    description:
      "传统 REST API 的参数名是给开发者看的，但 AI Agent 需要能「读懂」接口的语义。本文分享如何设计 Agent 友好的 API：参数命名、错误提示、响应摘要、HATEOAS 引导，附真实案例。",
    date: "2026-07-03",
    author: "龙虾出行技术团队",
    tags: ["API 设计", "AI Agent", "语义化", "最佳实践"],
    keywords: [
      "语义化 API",
      "Agent 友好 API",
      "AI API 设计",
      "LLM API",
      "llms.txt",
      "API 语义描述",
    ],
    content: [
      { type: "p", text: "当你的 API 用户从「人类开发者」变成「AI Agent」，设计的优先级就完全变了。Agent 不看你的文档（除非你写了 llms.txt），它会从接口的参数名、描述、响应结构里推断怎么用。本文分享我们在构建龙虾出行 Agent API 时的设计原则。" },
      { type: "h2", text: "原则一：参数用自然语言，不用内部编码" },
      { type: "p", text: "传统 OTA 的机票搜索要求传 from_code=SHA，开发者得先查机场三字码表。Agent 哪知道 SHA 是上海？语义化 API 应该接受 from=上海，在服务端自动解析成三字码。" },
      { type: "code", lang: "json", text: `// 传统 API（对 Agent 不友好）
{ "from_code": "SHA", "to_code": "SZX", "trip_mode": "domestic" }

// 语义化 API（Agent 直接能用）
{ "from": "上海", "to": "深圳", "date": "2026-08-01" }` },
      { type: "p", text: "把领域知识的复杂度留在服务端。Agent 只需说「上海到深圳」，你帮它处理三字码、行程模式、坐标解析这些细节。" },
      { type: "h2", text: "原则二：错误要告诉 Agent 怎么改" },
      { type: "p", text: "传统 API 的错误是给人看的：「参数错误」。Agent 看到这个会懵——哪个参数？怎么改？语义化的错误要带 hint：" },
      { type: "code", lang: "json", text: `{
  "error": {
    "code": "CITY_REQUIRED",
    "message": "city \"锦江\" 像是品牌名，需要明确城市",
    "hint": "请改用城市名，如「上海」；品牌用 brand 参数"
  }
}` },
      { type: "p", text: "Agent 看到 hint 就知道该怎么修参数，而不是盲目重试或放弃。这把「客服成本」从用户转移到了接口设计——一次设计好，所有 Agent 都受益。" },
      { type: "h2", text: "原则三：响应带摘要，Agent 不用自己组织语言" },
      { type: "p", text: "Agent 调完接口后，要把结果告诉用户。如果响应只有结构化字段，Agent 还得消耗 token 自己写一段「东方航空 MU5357，晚上 8 点半出发...」。不如直接在响应里给 summary：" },
      { type: "p", text: "这个 summary 是预先写好的、经过人工优化的自然语言。Agent 直接用，既省 token，又保证表达质量一致。" },
      { type: "h2", text: "原则四：用 suggestions 引导下一步（HATEOAS for Agents）" },
      { type: "p", text: "Agent 调完搜索后，接下来该干嘛？翻页？筛选？下单？与其让 Agent 猜，不如在响应里告诉它：" },
      { type: "code", lang: "json", text: `"suggestions": [
  { "action": "next_page", "reason": "还有更多航班（共167条）" },
  { "action": "filter_by_brand", "reason": "可按航司缩小范围" }
]` },
      { type: "p", text: "这是 HATEOAS（超媒体作为应用状态引擎）思想在 Agent 时代的复兴。Agent 不靠硬编码的流程，靠响应里的引导自然推进。" },
      { type: "h2", text: "原则五：写一份 llms.txt" },
      { type: "p", text: "llms.txt 是给 AI 爬虫和 Agent 的「使用说明书」，放在站点根目录。它用简洁的 Markdown 列出你的能力、接口、参数、示例。Agent 第一次接触你的服务时，读这份文件就能上手。" },
      { type: "p", text: "这不是替代 OpenAPI 文档——OpenAPI 给开发者用，llms.txt 给 Agent 用。两者面向不同读者，写法完全不同：前者精确详尽，后者简洁直觉。" },
      { type: "quote", text: "好的 Agent API 不是「让 AI 能调」，而是「让 AI 想调、会调、调得对」。语义化设计是这一切的起点。" },
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
