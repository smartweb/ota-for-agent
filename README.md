# 面向 AI Agent开发的OTA


## ✨ 特性

- **三大业务搜索**：机票、酒店、城际巴士，Tab 一键切换
- **极简设计语言**：黑白留白、龙虾橙红 `#FF5A1F`、圆角卡片、subtle 阴影
- **服务端鉴权 (BFF)**：API Token 仅存于 Vercel 环境变量，前端零泄露
- **加载 / 错误 / 空态**完整：骨架屏、错误重试、空结果提示
- **一键部署 Vercel**：基于 Next.js 14 App Router，推送即上线

## 🧱 技术栈

| 层 | 技术 |
|---|---|
| 框架 | Next.js 14 (App Router) |
| 语言 | TypeScript |
| 样式 | Tailwind CSS |
| 部署 | Vercel |
| 数据源 | [龙虾出行开放平台](https://docs.longxiachuxing.com/) `/open/v1/*` |

## 📂 目录结构

```
WebOTA/
├── app/
│   ├── layout.tsx              # 根布局 + Header + Footer
│   ├── page.tsx                # 首页：Hero + 搜索卡 + 热门目的地
│   ├── globals.css             # Tailwind 基础样式
│   ├── flight/page.tsx         # 机票搜索结果页
│   ├── hotel/page.tsx          # 酒店搜索结果页
│   ├── bus/page.tsx            # 巴士搜索结果页
│   └── api/proxy/route.ts      # Serverless BFF：注入 Token 后转发
├── components/
│   ├── Header.tsx
│   ├── SearchTabs.tsx          # 三业务 Tab 搜索表单
│   ├── ResultShell.tsx         # 客户端 fetch hook + 通用 UI 片段
│   ├── flight/FlightCard.tsx
│   ├── hotel/HotelCard.tsx
│   └── bus/BusCard.tsx
├── lib/
│   ├── api.ts                  # 服务端 API 客户端（注入 Bearer Token）
│   ├── types.ts                # 三个业务接口的 TS 类型
│   └── cities.ts               # 热门机场/城市数据
├── .env.local                  # 本地环境变量（不入库）
└── vercel.json
```

## 🔐 安全设计（BFF 模式）

```
浏览器 ──POST /api/proxy?type=flight──▶ Next.js Route Handler ──Bearer Token──▶ api.longxiachuxing.com
                                          （服务端，注入 Token）                    （真实业务接口）
```

- Token 永不进入前端 bundle / git
- 前端只调用自家 `/api/proxy`，由服务端注入 `Authorization: Bearer <token>` 后转发
- 统一解包 `{ code, message, data, request_id }`

## 🚀 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量（.env.local，已包含示例 Token）
cat > .env.local <<'EOF'
LONGXA_API_TOKEN=rdak_live_xxxxxxxxxxxxxxxx
LONGXA_API_BASE=https://api.longxiachuxing.com
EOF

# 3. 启动开发服务器
npm run dev          # http://localhost:3000

# 4. 生产构建
npm run build && npm run start
```

## ☁️ 部署到 Vercel

### 方式 A：CLI 一键部署

```bash
npm i -g vercel
cd WebOTA
vercel              # 首次部署（preview）
vercel --prod       # 正式环境
```
> 在 Vercel Dashboard → 项目 → **Settings → Environment Variables** 中添加。

### 方式 B：Dashboard Git 集成

1. 把本目录推送到 GitHub/GitLab
2. Vercel → **Add New Project** → 导入仓库
3. Framework Preset 自动识别为 **Next.js**，无需改 Build/Output 设置
4. 在 **Environment Variables** 里加入上面的两个变量
5. **Deploy**

### ⚠️ 重要：IP 白名单

龙虾出行开放平台要求**调用方 IP 在白名单内**。Vercel Serverless 的出口 IP 是动态的，部署后请：

1. 先在 Vercel 上部署并触发一次真实调用
2. 在 Vercel 函数日志里看实际出口 IP，或在龙虾开放平台后台填写 Vercel IP 段
3. 如平台只支持固定 IP，建议在中间加一层固定出口（如 Vercel + 你自有的 NAT/代理，或把 `lib/api.ts` 的 `API_BASE` 指向你的代理）

## 🧭 业务接口对照

| 业务 | 内部路径 | 上游接口 |
|---|---|---|
| 机票 | `/flight` → `POST /api/proxy?type=flight` | `POST /open/v1/flight/search` |
| 酒店 | `/hotel` → `POST /api/proxy?type=hotel` | `POST /open/v1/hotel/search` |
| 巴士 | `/bus` → `POST /api/proxy?type=bus` | `POST /open/v1/bus/search` |

## 📝 备注

- 金额单位：机票/酒店为「元」，巴士为「分」（已在 `BusCard` 中转换）
- 机票请求体的 schema 文档未完整声明，字段以平台示例为准
- 巴士接口实际要求 `start_addr` 或 `start_lng+start_lat` 提供一组（文档标"可选"），本项目已在 `cities.ts` 内置市中心坐标自动补全

## 🎨 设计要点

- 主色 `#FF5A1F`（龙虾橙红），Tailwind 扩展为 `brand-50…900`
- 字体栈：`ui-sans-serif / system-ui / PingFang SC`，参考 Vercel 的 Geist 风格
- 卡片 `rounded-2xl` + 1px `border-neutral-200` + hover `shadow-hover`
- 大字标题 + 充足留白，黑色文字层级 `neutral-900 / 600 / 500 / 400`
