# FinScope Design System

> 设计决策来源：`ui-ux-pro-max` Skill（search.py --design-system --density 8 --motion 4）+
> `AGENTS.md` 的金融终端视觉约束。本文件是 FinScope 唯一的视觉契约，所有页面与组件必须遵循。

---

## 1. 设计定位

| 维度 | 结论 |
| --- | --- |
| 产品 | 面向个人投资者的股票 / ETF / 指数 / 加密资产分析终端（纯前端演示） |
| 结构范式 | Enterprise Gateway 收敛为「左侧固定导航 + 顶部工具栏 + 主内容独立滚动」的终端壳 |
| 视觉风格 | Dark Mode (OLED) 深色优先，辅以完整的浅色主题 |
| 信息密度 | 8 / 10 —— 高密度表格、紧凑行高、等宽数字 |
| 动效强度 | 4 / 10 —— 150–300ms，仅用于状态反馈，禁止装饰性动画 |
| 关键词 | Professional · Data-Dense · Precise · Modern · Trustworthy · Responsive |

设计禁忌：普通后台管理模板感、大面积渐变/玻璃拟态、每页不同风格、卡片包裹一切、用留白掩盖功能缺失。

---

## 2. 颜色 Token

所有颜色以 CSS 变量定义于 [`src/styles/tokens.css`](../src/styles/tokens.css)，
通过 `tailwind.config.js` 映射为 Tailwind 类（`bg-panel`、`text-muted`、`border-border` 等）。
**禁止在组件中硬编码十六进制颜色**（图表颜色通过 `useChartTheme()` 读取变量）。

### 2.1 深色主题（默认，`data-theme="dark"`）

| Token | 值 | 用途 |
| --- | --- | --- |
| `--bg` | `#0B0F14` | 页面底色 |
| `--panel` | `#111821` | 一级面板 / 卡片 |
| `--panel-2` | `#151F2B` | 二级面板 / 表头 / 悬浮态 |
| `--panel-3` | `#1B2735` | 三级面板 / 输入框 |
| `--fg` | `#F1F5F9` | 主文字 |
| `--muted` | `#94A3B8` | 次级文字 |
| `--subtle` | `#64748B` | 辅助说明 / 占位 |
| `--border` | `#263241` | 常规边框 |
| `--border-strong` | `#34465C` | 强调边框 / 分隔 |
| `--accent` | `#4F8CFF` | 交互主色（链接、选中、焦点） |
| `--warn` | `#F5B942` | 警示 / DEMO 标识 |
| `--danger` | `#EF4444` | 危险操作（删除） |

### 2.2 浅色主题（`data-theme="light"`）

| Token | 值 |
| --- | --- |
| `--bg` | `#F5F7FB` |
| `--panel` | `#FFFFFF` |
| `--panel-2` | `#F8FAFC` |
| `--panel-3` | `#EEF2F7` |
| `--fg` | `#0B1220` |
| `--muted` | `#55657A` |
| `--subtle` | `#7C8CA1` |
| `--border` | `#DCE3EC` |
| `--border-strong` | `#C3CEDB` |
| `--accent` | `#2563EB` |

### 2.3 行情颜色（与主题正交的第二根轴）

行情颜色由 `data-market-colors` 控制，作用于 `--up` / `--down` 两个变量，
因此数字、标签、Sparkline、K 线、成交量、指标线会**同时**切换。

| 方案 | `data-market-colors` | `--up`（深色） | `--down`（深色） |
| --- | --- | --- | --- |
| 红涨绿跌（默认，CN 习惯） | `red-up` | `#F04452` | `#22A06B` |
| 绿涨红跌（US 习惯） | `green-up` | `#22A06B` | `#F04452` |

浅色主题下 `--up` / `--down` 使用加深版本（如 `#D81F31` / `#0F8A58`）以保证 AA 对比度。

语义映射规则：

- **绝对禁止**用「红/绿」字面量命名类名；一律使用 `text-up` / `text-down` / `bg-up-soft` / `bg-down-soft`。
- 涨跌方向只由数值符号决定：`change >= 0 → up`，`change < 0 → down`，`0 → muted`。
- 辅助色 `--warn` 只用于 DEMO / 数据延迟提示，不参与涨跌语义。

---

## 3. 字体

| 角色 | 字体 | 说明 |
| --- | --- | --- |
| Heading / UI | **Fira Sans** | 标签、标题、按钮、表格文本 |
| Numeric / Mono | **Fira Code** | 所有价格、涨跌幅、成交量、代码、K 线数值 |

规则：

- 所有数字必须使用 `.fs-num`（Fira Code + `tabular-nums` + `font-variant-numeric`），避免列对齐抖动。
- 字号阶梯（Tailwind）：`2xs` 10px / `xs` 12px / `sm` 13px / `base` 14px / `lg` 16px / `xl` 20px / `2xl` 24px / `3xl` 30px。
- 标签使用 `.fs-label`：10px、全大写、`letter-spacing: 0.14em`、`--muted`。
- 核心行情数字视觉优先级：`3xl`（详情页主价格） > `2xl`（StatCard 数值） > `lg`（表格价格） > `sm`（辅助值）。

---

## 4. 间距 · 圆角 · 阴影

- 间距基准 4px；面板内边距 `16px`（`p-4`），页面栅格间距 `16px`（`gap-4`），区块间距 `16–24px`。
- 圆角：`--radius-sm 4px`（chip / 徽标）、`--radius 6px`（按钮 / 输入 / 卡片）、`--radius-lg 10px`（面板 / 弹窗）。
- 阴影：仅用于浮层。`--shadow-panel` 用于面板悬浮，`--shadow-pop` 用于弹窗 / 下拉。深色主题阴影为黑色 40–60% 透明。
- 边框优先于阴影表达层级：`border-border` 为默认，`border-border-strong` 表示激活。

---

## 5. 布局

| 断点 | 布局 |
| --- | --- |
| `≥1280px` | 侧栏 232px 固定；顶部栏 56px；主区 12 列栅格 |
| `1024–1279px` | 侧栏可折叠至 68px；卡片栅格 2 列 |
| `768–1023px` | 侧栏折叠为图标条（68px）；图表全宽；表格局部横向滚动 |
| `<768px` | 侧栏隐藏，底部/抽屉式移动导航；卡片 1–2 列自适应；触控目标 ≥44×44px |

约束：

- `<html>` / `<body>` 设置 `overflow: hidden`，主内容区独立滚动（`overflow-y: auto`）。
- 任何页面不得出现整体横向溢出；宽表格放入 `.fs-scroll-x`。
- 弹窗最大高度 `88vh`，内部滚动；移动端为全宽抽屉。

---

## 6. 组件规范

### 面板 `.fs-panel`
`bg-panel` + `border border-border` + `rounded-lg`。结构：header（`min-h-12`，标题 13px 半粗 + 可选副标题/actions）→ body（`p-4`，可 `flush`）→ 可选 footer。

### 按钮 `.fs-btn`
- 高度 32px（表格内）/ 36px（表单主操作）。
- `primary`：`bg-accent` + `text-white`；`ghost`：透明 + hover `bg-panel-2`；`danger`：`text-danger` + hover `bg-danger/10`。
- 图标按钮 `.fs-icon-btn` 为正方形 32×32，移动端触控热区扩展到 44×44。
- **禁止**只有 hover 效果而无实际行为的按钮。

### 表格 `.fs-th` / `.fs-td` / `.fs-row`
- 表头 11px 大写 muted，行高 40–44px，`border-b border-border/60`。
- 数字列右对齐并 `.fs-num`；代码列左对齐 mono。
- hover 整行高亮 `bg-panel-2`，不用斑马纹。
- 排序表头显示 `ArrowUp/Down` 指示器，可点击切换 升序 → 降序。

### 图表
- 统一由 `useChartTheme()` 提供 `up/down/accent/grid/muted/border/panel/fg`，切换主题或行情颜色时图表必须重绘（`key = theme:marketColors`）。
- 网格线仅保留水平线，透明度低；坐标轴不画轴线，仅保留刻度文字（11px，`--subtle`）。
- Tooltip：`bg-panel-2` + `border-border` + `shadow-pop`，数值 mono 右对齐。
- 折线/面积图：上涨区间用 `--up`，下跌区间用 `--down`；面积渐变从 22% 透明到 0。
- K 线：`--up` 空心/实心与 `--down` 相反（跟随行情颜色轴），成交量柱透明度 60%。
- 图表必须在 `ResizeObserver` 下自适应，禁止固定像素宽度导致溢出。

### 状态与反馈
- `EmptyState`：图标 + 一句说明 + 一个明确操作按钮。
- `LoadingState`：`.fs-skeleton` shimmer，禁止出现真实数值占位。
- `ErrorState`：错误摘要 + 重试按钮（重试必须真实重新执行）。
- `Toast`：右上角堆叠，4.2s 自动消失，success/error/info 三态。
- `ConfirmDialog`：破坏性操作必须二次确认，主按钮为 danger。

### DEMO 标识
- 顶部 `DemoDataBadge variant="banner"` 常驻：`DEMO DATA — NOT LIVE MARKET DATA`。
- 新闻 / 日历条目内联 `Demo` 徽标，来源为虚构机构，不得出现真实新闻链接。

---

## 7. 交互与动效

- 时长：hover/focus `150ms`，面板展开 `220ms`，页面/抽屉 `300ms`；缓动 `cubic-bezier(0.2, 0, 0, 1)`。
- 允许：颜色过渡、透明度、位移 ≤8px、骨架 shimmer。
- 禁止：密集表格中的 overshoot / 弹跳、无限循环装饰动画、视差。
- `prefers-reduced-motion` 下全局关闭动画。
- 焦点环：`outline: 2px solid var(--accent); outline-offset: 2px`，禁止 `outline: none`。
- 所有可点击元素键盘可达（`Tab`），弹窗内为焦点陷阱并支持 `Esc` 关闭。

---

## 8. 应用方式

```html
<html lang="en" data-theme="dark" data-market-colors="red-up">
```

- 主题切换：`useSettingsStore.setTheme()` → `applyThemeToDocument()` 修改 `<html>` 属性，并持久化到 `finscope.settings.v1`。
- 首次加载在 `main.tsx` 中读取持久化设置后再挂载，避免主题闪烁。
- 数字格式化统一走 `useFormatters()`（价格精度按资产类别、货币按 `baseCurrency`、大数按 `numberFormat`）。
