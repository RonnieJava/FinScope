# FinScope 测试计划与结果

## 1. 目标与范围

验证三件事：

1. **金融计算正确**：组合成本、买卖、已实现 / 未实现盈亏、收益与风险指标、技术指标。
2. **数据层稳定**：Mock 序列可复现、类型完整、搜索 / 筛选 / 排序真实生效。
3. **界面可用**：九个页面可导航、交互真实、无横向溢出、无控制台错误、移动端可操作。

不在范围内：真实行情正确性、后端 / API 契约、真实交易与账户体系（本项目不包含这些模块）。

---

## 2. 自动化单元测试（Vitest）

运行：

```bash
npm run test          # 单次
npm run test:watch    # watch
```

配置：`vite.config.ts` → `test: { environment: 'node', include: ['src/**/*.test.ts'] }`；
需要 DOM 的持久化用例在文件首行声明 `// @vitest-environment jsdom`，并用 `vi.hoisted()` 注入内存
`localStorage`（规避 Node 25 实验性 `localStorage` 与 jsdom 实现的冲突）。

### 2.1 用例分布

| 文件 | 用例数 | 覆盖内容 |
| --- | ---: | --- |
| `src/utils/format.test.ts` | 17 | `formatPrice` / `formatPercent` / `formatSignedNumber` / `formatCompactNumber` / `formatBigNumber` / `formatCurrency`、演示汇率换算、`clamp` / `roundTo`、`assetDecimals`、`pnlTone`、日期与相对时间 |
| `src/utils/indicators.test.ts` | 14 | `sma`、`ema`、`rsi`（含极端 0/100 与边界）、`macd`（signal / histogram 对齐）、`periodReturn`；数据不足时返回全 `null` |
| `src/utils/analytics.test.ts` | 26 | `dailyReturns`、`cumulativeReturn`、`annualizedVolatility`、`maxDrawdown`（含单调上涨与空序列）、`sharpeRatio`、`pearsonCorrelation`、`correlationMatrix`（对称 + 对角 1）、`concentrationIndex`（HHI 0–10000）、`normalizedSeries`、`returnContributions`、`downsideDeviation` |
| `src/utils/portfolio.test.ts` | 18 | 移动加权平均成本：手续费计入成本、二次买入重算均价、部分卖出保持均价、清仓移除持仓；拒绝超卖 / 非正数量 / 非正价格 / 负手续费；`buildLedger` 现金与已实现盈亏闭环；`computePortfolio` 分离已实现 / 未实现、当日盈亏、持仓权重；`validateTransaction`（含超出演示现金） |
| `src/services/data.test.ts` | 20 | 资产目录唯一性与大小写不敏感查找、每个资产均有报价、`searchAssets` 的关键词 / 类别 / 空查询行为、历史序列点数与 OHLC 内部一致性、close 序列与 candles 同源、新闻与日历排序稳定且均标记 DEMO、市场涨跌统计、演示组合 `现金 + 市值 = 总资产` |
| `src/store/persistence.test.ts` | 11 | 自选去重 / 大写归一 / toggle / 写入 / 模拟刷新后 rehydrate / 清空；设置项各自独立更新、`reset` 恢复默认、刷新后恢复、`html` 上 `data-theme` 与 `data-market-colors` 双轴同步 |
| **合计** | **106** | 6 个文件 |

### 2.2 最近一次结果

```
✓ src/utils/format.test.ts        (17 tests)
✓ src/services/data.test.ts       (20 tests)
✓ src/utils/analytics.test.ts     (26 tests)
✓ src/utils/indicators.test.ts    (14 tests)
✓ src/store/persistence.test.ts   (11 tests)
✓ src/utils/portfolio.test.ts     (18 tests)

Test Files  6 passed (6)
     Tests  106 passed (106)
```

此外 `npm run build` 中的 `tsc --noEmit` 在 TypeScript `strict` + `noUnusedLocals` + `noUnusedParameters`
下通过，作为类型层面的门禁。

---

## 3. 浏览器验收

### 3.1 方法

在生产构建产物上使用 headless Chrome（`playwright-core` + 本机 Chrome，脚本不随仓库分发）执行：

1. **路由巡检**：4 档视口 × 10 条路由（含 404）逐页加载，
   断言 `documentElement.scrollWidth <= innerWidth`，并逐元素检查 `getBoundingClientRect().right`
   是否越界（祖先为 `overflow-x: auto | scroll` 的滚动容器内元素豁免）。
2. **控制台扫描**：收集 `console.error` 与 `pageerror`。
3. **交互断言**：14 项关键流程。
4. **移动端触控审计**：390×844 下所有 `button / a / [role=button] / input / select` 的高度不得 < 40px
   （表头排序与筛选 chip 允许紧凑，单独豁免）。

复跑方式（本地 APFS 目录）：

```bash
npm run build
npx vite preview --port 4318 --strictPort   # 另开终端
# 使用 playwright-core 指向本机 Chrome 运行巡检脚本
```

> 项目 `devDependencies` 不含 Playwright，避免为一次性验收增加常规安装体积；如需长期保留，
> 建议改为 `@playwright/test` 并纳入 CI。

### 3.2 视口矩阵

| 视口 | 覆盖重点 |
| --- | --- |
| 1440 × 900 | 桌面完整布局、图表宽度、表格密度 |
| 1280 × 800 | 笔记本常见尺寸、侧栏折叠 |
| 768 × 1024 | 平板：卡片重排、表格局部横向滚动 |
| 390 × 844 | 手机：移动导航、无整页横向溢出、触控面积 |

### 3.3 交互断言与结果

| # | 断言 | 结果 |
| --- | --- | --- |
| 1 | 主题切换并持久化（`dark → light`，刷新后保持） | PASS |
| 2 | 行情颜色切换（`--up` 由 `#f04452` 变为 `#22a06b`） | PASS |
| 3 | Markets 搜索（58 → 1 条，计数同步） | PASS |
| 4 | Markets 类别筛选（Crypto：8 条，行数一致） | PASS |
| 5 | Markets 分页（第 2 页内容变化） | PASS |
| 6 | 自选添加并写入 localStorage（`AAPL,NVDA,SPY,BTC-USD,TSLA,GLD,MSFT`） | PASS |
| 7 | 组合超卖被拒绝（校验 Toast） | PASS |
| 8 | 组合新增交易（交易数 11 → 12） | PASS |
| 9 | 新闻详情弹窗（`role="dialog"` 打开） | PASS |
| 10 | 日历换月（10 月 22 个事件 → 11 月 6 个事件） | PASS |
| 11 | 日历选中日期展示当日事件 | PASS |
| 12 | 资产详情图表渲染（3 个 canvas） | PASS |
| 13 | 移动端抽屉导航打开 | PASS |
| 14 | 移动端触控目标 ≥ 40px | PASS |

汇总：**0 处横向溢出、0 条控制台错误、14/14 交互通过**。

### 3.4 验收中发现并修复的问题（回归记录）

| 问题 | 根因 | 修复 |
| --- | --- | --- |
| `/watchlist` 整页白屏（React error #300） | `useAssetsWithQuotes()` 在 `useMemo` 回调内调用，违反 Hooks 规则 | 提升到组件顶层，`useMemo` 依赖改为 `[allRows, addQuery, symbols]` |
| 390px 下 `/calendar` 横向溢出（元素右边界 457px） | `Panel` 的 actions 容器 `shrink-0` 且内部 `fs-scroll-x` 无 `min-w-0` | actions 改为 `min-w-0 shrink`，`.fs-scroll-x` 增加 `min-w-0` |
| 移动端触控目标过小（36×55 用户菜单、28×28 星标、34px 行链接） | 桌面紧凑尺寸未做移动端补偿 | 媒体查询覆盖 `fs-btn` / `fs-icon-btn` / 输入控件，并新增 `fs-touch-target` / `fs-touch-target-row` 类 |
| 预览时 favicon 404 | 缺少图标 | `index.html` 内联 SVG data URI favicon |
| 首屏单 chunk 1,563 kB | ECharts 全量引入 | `echarts/core` 按需注册 + `manualChunks` 拆分 |

---

## 4. 手工检查清单

| 检查项 | 结论 |
| --- | --- |
| 九页 + 404 全部可达，侧栏高亮与当前路由一致 | 通过 |
| 全局搜索可键盘上下选择、Enter 跳转、Esc / 点击外部关闭 | 通过 |
| Dashboard 时间范围切换后图表序列真实变化 | 通过 |
| 资产详情：分时 / K 线切换、十字线、OHLC、SMA/EMA、RSI/MACD | 通过 |
| 未知代码（如 `/assets/NOPE`）显示未找到状态 | 通过 |
| 自选清空后显示空态与添加入口，刷新不覆盖已保存列表 | 通过 |
| 组合：买入 / 部分卖出 / 清仓 / 编辑 / 删除 / 超卖拒绝 / 手续费独立 | 通过 |
| Analytics：口径说明可见，样本不足时提示「数据不足」 | 通过 |
| 新闻与日历详情弹窗在 390px 下不超出屏幕 | 通过 |
| 主题与行情颜色切换后数字、标签、图表颜色全部同步 | 通过 |
| 设置项（默认类别 / 默认周期 / 数字格式 / 基础货币）实际影响页面 | 通过 |
| 刷新后主题、自选、组合、最近查看全部恢复 | 通过 |

---

## 5. 尚未自动化 / 后续可选

- **E2E 未入库**：当前浏览器巡检为一次性外部脚本，未作为 `npm run test:e2e` 固化。
- **视觉回归**：未接入截图基线比对（色彩 Token 与布局变更需人工确认）。
- **性能预算**：仅记录构建产物体积（ECharts gzip ≈ 185 kB），未做 Lighthouse 阈值门禁。
- **无真实后端**：不存在接口契约测试；接入真实数据时需新增数据适配层与对应契约测试。
