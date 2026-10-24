# FinScope 组件清单

约定：

- 所有组件为函数组件，`Props` 就近声明，不导出跨文件的隐式约定。
- 组件只负责渲染与交互，**不直接生成行情数据**；数据来自 `services/data.ts` 或上层页面。
- 颜色、间距、圆角一律使用 `src/styles/tokens.css` 与 `globals.css` 中的 Token / 组件类，
  禁止在组件内硬编码颜色。
- 图表统一通过 `useChartTheme()` 读取当前主题计算样式，主题或行情颜色切换后自动重建。

目录：`src/components/`

---

## 1. layout — 应用骨架

| 组件 | 文件 | 职责 | 关键 props / 行为 |
| --- | --- | --- | --- |
| `AppLayout` | `layout/AppLayout.tsx` | 终端外壳：左侧 `Sidebar` + 顶部 `Topbar` + 主内容滚动区 + `ToastViewport` | 无 props；内部管理移动端导航开合状态，`<Outlet />` 渲染页面 |
| `Sidebar` | `layout/Sidebar.tsx` | 桌面端导航（Dashboard / Markets / Watchlist / Portfolio / Analytics / News / Calendar / Settings），支持折叠 | 无 props；读取 `useSettingsStore().sidebarCollapsed`；导出 `NAV_ITEMS` 供移动端复用 |
| `MobileNavigation` | `layout/MobileNavigation.tsx` | 移动端抽屉导航（`role="navigation"`，`aria-label="Mobile primary"`） | `open: boolean`、`onClose: () => void`；Esc 关闭、点击遮罩关闭 |
| `Topbar` | `layout/Topbar.tsx` | 全局搜索、演示市场状态、数据更新时间（ET）、主题切换、行情颜色切换、用户偏好菜单 | `onOpenMobileNav: () => void`；用户菜单含设置跳转与「恢复默认」 |
| `GlobalSearch` | `layout/GlobalSearch.tsx` | 顶栏资产搜索：按代码 / 名称即时匹配，键盘上下选择 + Enter 跳转 `/assets/:symbol` | 无 props；点击外部关闭；结果展示类别与涨跌幅 |

## 2. ui — 基础展示单元

| 组件 | 文件 | 职责 | 关键 props |
| --- | --- | --- | --- |
| `Panel` | `ui/Panel.tsx` | 统一面板容器（标题 / 副标题 / 右侧动作 / 可 flush 主体） | `title?`、`subtitle?`、`actions?`、`flush?`、`className?`、`bodyClassName?` |
| `StatCard` | `ui/StatCard.tsx` | 指标卡：标签、数值、涨跌点数与百分比、Sparkline、脚注，可整体链接 | `label`、`value`、`change?`、`changePercent?`、`spark?`、`footnote?`、`to?`、`emphasis?` |
| `MiniSparkline` | `ui/MiniSparkline.tsx` | 纯 SVG 迷你走势图（无第三方依赖，按 `--up` / `--down` 着色） | `values: number[]`、`tone?: 'up' \| 'down' \| 'flat'`、`width?`、`height?`、`filled?` |
| `RangeTabs` | `ui/RangeTabs.tsx` | 时间范围切换（1D / 1W / 1M / 3M / 6M / 1Y） | `value: TimeRange`、`onChange`、`label?`；导出 `TIME_RANGES` |
| `Modal` | `ui/Modal.tsx` | 可访问弹窗壳（Portal、焦点回收、Esc 关闭、内部滚动） | `open`、`onClose`、`title?`、`subtitle?`、`footer?`、`size?: 'md' \| 'lg' \| 'xl'` |
| `Tooltip` | `ui/Tooltip.tsx` | 轻量悬浮提示（用于指标口径等说明） | `label: ReactNode`、`side?: 'top' \| 'bottom'` |
| `ThemeToggle` | `ui/ThemeToggle.tsx` | 深 / 浅主题切换按钮 | `withLabel?`；写入 `settings` store，`html[data-theme]` 同步 |
| `MarketColorToggle` | `ui/MarketColorToggle.tsx` | 「红涨绿跌 / 绿涨红跌」切换 | `withLabel?`；写入 `settings` store，`html[data-market-colors]` 同步 |
| `DemoDataBadge` | `ui/DemoDataBadge.tsx` | DEMO 标识（内联徽标或顶部横幅） | `variant?: 'inline' \| 'banner'`、`message?`，默认 `DEMO DATA — NOT LIVE MARKET DATA` |

## 3. charts — 图表

| 组件 | 文件 | 职责 | 关键 props |
| --- | --- | --- | --- |
| `EChart` | `charts/EChart.tsx` | ECharts 通用包装：按需注册 Line / Bar / Pie + Grid / Tooltip / Legend / MarkLine / Graphic，尺寸自适应，主题重建 | `option: EChartsOption`、`themeKey`、`height?`、`ariaLabel?` |
| `MarketOverviewChart` | `charts/MarketOverviewChart.tsx` | Dashboard 主趋势图：面积线 + 时间轴 + Tooltip + 区间涨跌摘要 | `series: HistoricalPrice[]`、`symbol`、`range`、`height?` |
| `CandlestickChart` | `charts/CandlestickChart.tsx` | lightweight-charts K 线：蜡烛 + 成交量柱 + SMA20 / SMA50，悬浮十字线与 OHLC 回调 | `candles: Candle[]`、`showVolume?`、`showSma?`、`onHover?` |
| `VolumeChart` | `charts/VolumeChart.tsx` | 独立成交量柱状图（资产详情页使用） | `candles: Candle[]`、`range`、`height?` |
| `AssetAllocationChart` | `charts/AssetAllocationChart.tsx` | 资产配置环形图 + 图例 | `slices: AllocationSlice[]`、`total: number`、`height?` |
| `PerformanceChart` | `charts/PerformanceChart.tsx` | 多序列折线图（组合收益 vs 基准、历史收益曲线） | `labels: string[]`、`series: LineSeries[]`、`height?`、`valueSuffix?`、`decimals?` |

## 4. market — 行情数据展示

| 组件 | 文件 | 职责 | 关键 props |
| --- | --- | --- | --- |
| `AssetTable` | `market/AssetTable.tsx` | 通用行情表（代码 / 名称 / 类别 / 价格 / 涨跌幅 / 成交量 / Sparkline / 操作），支持排序与空态 | `rows: AssetWithQuote[]`、`showClass?`、`showSparkline?`、`sparkRange?`、`sort?`、`onSort?`、`renderActions?`、`emptyTitle?`、`emptyDescription?` |
| `AssetRow` | `market/AssetRow.tsx` | 单行资产：自选星标、链接到详情、价格 / 涨跌幅 / 成交量 / Sparkline、可选操作列 | `row: AssetWithQuote`、`spark?`、`showClass?`、`actions?` |
| `WatchlistPanel` | `market/WatchlistPanel.tsx` | 自选面板（Dashboard 侧栏与 Watchlist 页复用） | `limit?`、`className?`；读取 `useWatchlistStore`，空态引导添加 |

## 5. portfolio — 组合

| 组件 | 文件 | 职责 | 关键 props |
| --- | --- | --- | --- |
| `PortfolioSummary` | `portfolio/PortfolioSummary.tsx` | 总资产、持仓市值、现金、当日盈亏、累计盈亏指标区 | `portfolio: Portfolio` |
| `TransactionForm` | `portfolio/TransactionForm.tsx` | 买入 / 卖出登记与编辑表单（代码、数量、价格、手续费、日期），前端校验后写入 store | `open: boolean`、`editing?: PortfolioTransaction \| null`、`onClose` |

## 6. news / calendar

| 组件 | 文件 | 职责 | 关键 props |
| --- | --- | --- | --- |
| `NewsCard` | `news/NewsCard.tsx` | 演示新闻卡片（分类、时间、摘要、DEMO 标记），`compact` 用于相关新闻 | `item: NewsItem`、`onOpen`、`compact?` |
| `CalendarGrid` | `calendar/CalendarGrid.tsx` | 月历栅格：周一为首列，标记当日事件数量与分类，点击选中日期 | `month: Date`、`events: EconomicEvent[]`、`selectedDate: string`、`onSelectDate` |

## 7. feedback — 状态与提示

| 组件 | 文件 | 职责 | 关键 props |
| --- | --- | --- | --- |
| `EmptyState` | `feedback/EmptyState.tsx` | 空数据占位（图标 + 标题 + 描述 + 可选动作） | `title`、`description?`、`icon?: ReactNode`、`action?: ReactNode` |
| `LoadingState` | `feedback/LoadingState.tsx` | 骨架屏加载态 | `rows?`、`label?` |
| `ErrorState` | `feedback/ErrorState.tsx` | 错误提示（可选重试按钮） | `title?`、`description?`、`onRetry?`、`className?` |
| `ConfirmDialog` | `feedback/ConfirmDialog.tsx` | 危险操作二次确认（删除交易等），默认聚焦确认按钮 | `open`、`title`、`description?`、`confirmLabel?`、`cancelLabel?`、`tone?: 'danger' \| 'primary'`、`onConfirm`、`onCancel` |
| `Toast` / `ToastViewport` | `feedback/Toast.tsx` | 全局 Toast 容器；`toastSuccess` / `toastError` / `toastInfo` 由 `store/toast.ts` 暴露 | 无 props（`ToastViewport`）；store 驱动，自动消失，`aria-live` |

---

## 组合方式示例

```tsx
<Panel
  title="Top gainers"
  subtitle="Demo snapshot"
  actions={<RangeTabs value={range} onChange={setRange} />}
>
  <AssetTable rows={gainers} sort={sort} onSort={setSort} />
</Panel>
```

```tsx
<CandlestickChart candles={candles} showVolume showSma onHover={setHoveredCandle} />
```

## 新增组件的约定

1. 先判断是否可复用现有 `Panel` / `StatCard` / `AssetTable` / `Modal`，避免重复实现。
2. 计算逻辑抽到 `src/utils/`，组件只消费结果；新增计算必须补 Vitest 用例。
3. 颜色用 Token；数字用 `fs-num` 等宽类；可点击元素在移动端需满足 ≥44px 触控面积
   （使用 `fs-btn` / `fs-icon-btn`，或添加 `fs-touch-target` 类）。
4. 表格类组件需包裹在 `fs-scroll-x` 中，确保窄屏局部横向滚动而不撑破页面。
