# FinScope

面向个人投资者的股票 / ETF / 指数 / 加密资产分析终端前端。深色优先、数据密度高、图表可交互，
包含 9 个可访问页面、统一本地 Mock 数据层、可操作的演示投资组合与完整中英双语无关的设置体系。

> **DEMO DATA — NOT LIVE MARKET DATA**
> 本项目为纯前端演示工程：不连接任何行情源、券商或后端服务，所有价格、新闻、经济事件均为合成数据。

---

## 快速开始

环境要求：Node.js ≥ 20，npm ≥ 10。

```bash
npm install
npm run dev        # http://localhost:5173
```

生产构建与本地预览：

```bash
npm run build
npm run preview
```

## 可用脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动 Vite 开发服务器（HMR） |
| `npm run build` | `tsc --noEmit` 类型检查 + 生产构建 |
| `npm run preview` | 预览 `dist/` 产物 |
| `npm run typecheck` | 仅执行 TypeScript strict 类型检查 |
| `npm run test` | Vitest 单次运行全部单元测试 |
| `npm run test:watch` | Vitest watch 模式 |

## 技术栈

- React 18 + TypeScript 5（`strict` / `noUnusedLocals` / `noUnusedParameters`）
- Vite 6 + Tailwind CSS 3（CSS 变量 Token + `data-*` 主题）
- React Router 6
- ECharts 5（`echarts/core` 按需注册）+ lightweight-charts 4（K 线）
- Zustand 5 + `persist`（本地持久化）
- Lucide React 图标
- Vitest 3（Node 环境，jsdom 仅在需要 DOM 的用例中按文件启用）

## 路由

| 路径 | 页面 | 说明 |
| --- | --- | --- |
| `/` | Dashboard | 指数概览、趋势图、涨跌幅榜、自选、ETF、加密、新闻、最近查看 |
| `/markets` | Markets | Stocks / ETFs / Indices / Crypto 全量表格，搜索、筛选、排序、分页 |
| `/assets/:symbol` | Asset Detail | 分时 / K 线 / 成交量、SMA / EMA / RSI / MACD、相关资产 |
| `/watchlist` | Watchlist | 自选增删、搜索、排序、筛选，localStorage 持久化 |
| `/portfolio` | Portfolio | 持仓、交易登记、已实现 / 未实现盈亏、资产配置与收益曲线 |
| `/analytics` | Analytics | 累计收益、年化波动率、最大回撤、夏普、相关性、集中度、基准对比 |
| `/news` | News | 演示新闻列表、关键词 / 分类 / 日期筛选、详情弹窗 |
| `/calendar` | Calendar | 月历、经济事件、分类筛选、日期选择与当日事件 |
| `/settings` | Settings | 主题、行情颜色、默认资产类别、默认周期、数字格式、基础货币 |
| `*` | NotFound | 未匹配路由的兜底页面 |

## 目录结构

```
src/
  app/router.tsx            路由表（9 页 + 404，统一挂在 AppLayout 下）
  components/
    layout/                 AppLayout / Sidebar / MobileNavigation / Topbar / GlobalSearch
    charts/                 EChart 包装、MarketOverviewChart、CandlestickChart、VolumeChart、
                            AssetAllocationChart、PerformanceChart
    market/                 AssetTable / AssetRow / WatchlistPanel
    portfolio/              PortfolioSummary / TransactionForm
    news/                   NewsCard
    calendar/               CalendarGrid
    ui/                     Panel / StatCard / MiniSparkline / RangeTabs / Modal / Tooltip /
                            ThemeToggle / MarketColorToggle / DemoDataBadge
    feedback/               EmptyState / LoadingState / ErrorState / ConfirmDialog / Toast
  pages/                    10 个页面组件
  mocks/                    assets / quotes / historicalPrices / candles / news / calendar /
                            portfolio / universe（确定性合成序列）
  services/data.ts          统一数据访问层（组件不直接拼装行情）
  store/                    settings / watchlist / portfolio / recent / toast
  utils/                    format / indicators / analytics / portfolio / date / random
  types/index.ts            领域类型定义
  styles/                   tokens.css（主题变量）/ globals.css（组件类与触控规则）
docs/                       DESIGN_SYSTEM.md / COMPONENTS.md / TEST_PLAN.md
```

## Mock 数据与确定性

- 所有序列由固定种子的伪随机生成器（FNV-1a + mulberry32）产出，**同一次构建内刷新结果不变**，
  不存在「渲染时随机价格」。
- `DEMO_NOW` 固定为 `2026-10-23T19:42:00Z`（15:42 ET），顶栏显示的时间、市场状态与页面日期均以此为准。
- 数据访问统一走 [`src/services/data.ts`](src/services/data.ts)：
  `getAssets` / `getAssetBySymbol` / `getQuote` / `getQuoteMap` / `getAssetsWithQuotes` / `getHistoricalPrices` / `getCandles` /
  `getCloseSeries` / `getMarketOverview` / `getTopMovers` / `getNews` / `getCalendarEvents` /
  `getPortfolio` 等。
- 组件禁止维护重复行情数据；格式化统一使用 `formatPrice` / `formatPercent` / `formatCurrency` /
  `formatCompactNumber` / `formatDateTime`（见 `src/utils/format.ts`）。

## 主题与行情颜色

- `data-theme="dark" | "light"` 与 `data-market-colors="red-up" | "green-up"` 同时挂在 `<html>` 上。
- 所有行情数字、箭头、迷你图、K 线、面积图颜色均读取 CSS 变量（`--up` / `--down`），
  切换后整站图表同步更新（图表通过 `useChartTheme()` 读取计算样式后重建）。
- 用户偏好经 Zustand `persist` 写入 `localStorage`，刷新后保持。

## 金融计算

- 组合采用**移动加权平均成本法**：买入更新均价，卖出按当前均价结转成本并计入已实现盈亏；
  手续费独立累计，不混入成本价展示口径。
- 禁止超卖、禁止非正数量与负价格，校验失败以 Toast 反馈。
- 核心逻辑位于 [`src/utils/portfolio.ts`](src/utils/portfolio.ts)、[`src/utils/analytics.ts`](src/utils/analytics.ts)、
  [`src/utils/indicators.ts`](src/utils/indicators.ts)，完全不依赖 React，可独立单测。
- 历史样本不足时（如相关性、夏普）返回「数据不足」而不是编造数值。

## 测试

```bash
npm run test
```

当前结果：**6 个测试文件 / 106 个用例全部通过**。详见 [docs/TEST_PLAN.md](docs/TEST_PLAN.md)。

浏览器验收（4 档视口 × 10 条路由、14 项交互断言、横向溢出与控制台错误扫描）在本地构建产物上执行，
结果：0 横向溢出、0 控制台错误、14/14 交互通过。Playwright 依赖未写入本项目 `devDependencies`，
如需复跑请自行安装 `playwright-core` 并指向本机 Chrome（见 TEST_PLAN 的复跑说明）。

## 已知限制

- 纯前端：没有后端、数据库、真实认证或交易通道；组合与自选仅存于当前浏览器 `localStorage`。
- 新闻与日历事件为虚构内容，均带 `DEMO` 标识，不包含任何真实机构或外部链接。
- 图表库体积较大（ECharts 已按需注册并拆分 chunk），首屏仍会加载约 185 kB gzip 的 ECharts。
- 若项目位于 NTFS / 网络等特殊文件系统，esbuild 的 Go 二进制可能因 mmap 限制崩溃（macOS 上表现为 `SIGBUS`）；
  此时将仓库复制到本地 APFS 目录构建即可，源码无需改动。

## 文档

- [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) — 设计定位、颜色 Token、字体、栅格、组件与图表规范
- [docs/COMPONENTS.md](docs/COMPONENTS.md) — 组件清单、职责与关键 props
- [docs/TEST_PLAN.md](docs/TEST_PLAN.md) — 测试范围、用例分布、浏览器验收矩阵与结果
