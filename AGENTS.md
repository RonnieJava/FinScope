# FinScope — 专业金融数据分析网站前端开发任务

## 一、项目目标

使用 Trae 开发一个高质量的金融数据分析网站前端，项目名称为 FinScope。

你是一名资深 UI/UX 设计师、金融产品设计师和高级前端工程师。

**本项目仅开发前端。**

严禁开发或引入：
- Spring Boot
- Java 后端
- MySQL 或其他数据库服务
- 后端 API 服务
- 服务端认证系统
- 真实交易执行功能
- 需要服务器密钥的金融数据接口

所有页面使用统一的本地 Mock 数据和前端计算逻辑，确保项目在安装依赖后即可启动。

最终交付一个真正可以运行、操作、浏览和演示的金融网站，而不是静态设计稿。

## 二、第一步：调用 ui-ux-pro-max

开始编码前，必须先读取并使用已经安装的 `ui-ux-pro-max。

1. 阅读该 Skill 的 SKILL.md 和实际可用的参考资源。
2. 按照 Skill 的使用说明进行设计系统选择。
3. 针对金融数据分析网站，确定设计风格、配色、字体、布局、组件、图表规范和交互规则。
4. 如果 Skill 支持设计搜索、设计评分或设计审查，使用其实际可用的功能。
5. 将最终设计规范写入 `docs/DESIGN_SYSTEM.md`。
6. 不要直接套用普通后台管理模板。
7. 不要仅输出设计方案，完成设计决策后立即开发。

如果 Skill 无法调用，说明原因，不得假装已经调用成功。

## 三、前端技术栈

优先采用：

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- ECharts 或 Recharts
- Lightweight Charts，用于专业 K 线图
- Lucide React，用于图标
- Zustand 或 React Context，用于共享状态
- Vitest，用于单元测试
- Playwright，用于浏览器端测试（如果当前环境支持）

先检查已有项目。如果已有可用项目，优先在现有项目上开发；如果项目为空，再初始化工程。

使用与当前依赖兼容的稳定版本。安装前检查图表库的许可证和实际 API。

要求：
- TypeScript strict 模式
- 组件化设计
- 统一的样式 Token
- 统一 Mock 数据层
- 统一金融计算工具
- 清晰的页面与组件目录
- 不引入无用依赖
- 不使用真实服务端 API
- 不在前端放置任何 API Secret

## 四、产品定位与设计风格

产品名称：FinScope

定位：面向个人投资者的股票、ETF、指数和加密货币市场分析工具。

主要视觉方向：

**专业金融终端 + 现代金融 SaaS + 高品质数据可视化。**

设计关键词：
- Professional
- Data-Dense
- Precise
- Modern
- Trustworthy
- Responsive

### 设计规范

默认采用深色主题。

初始颜色参考：
- 页面背景：#0B0F14
- 主面板：#111821
- 次级面板：#151F2B
- 主文字：#F1F5F9
- 次级文字：#94A3B8
- 边框：#263241
- 强调色：#4F8CFF
- 上涨色：#F04452
- 下跌色：#22A06B
- 警告色：#F5B942

最终颜色由 ui-ux-pro-max-skill 结合设计规范统一确定。

必须支持：
- 深色主题
- 浅色主题
- 红涨绿跌
- 绿涨红跌

颜色切换后，所有相关行情数字、标签和图表颜色都必须同步更新。

### 视觉质量要求

- 统一字体、间距、边框和圆角。
- 核心行情数字具有清晰的视觉优先级。
- 主要图表具有足够的展示空间。
- 表格数据密度高但易于阅读。
- 使用克制的动画和悬浮效果。
- 不要过度使用渐变、玻璃拟态和装饰性图标。
- 不要将所有内容都塞进卡片。
- 不要用大面积空白掩盖功能不足。
- 不要让每个页面拥有不同的设计风格。

## 五、整体布局

### 桌面端

左侧导航栏：
- FinScope Logo
- Dashboard
- Markets
- Watchlist
- Portfolio
- Analytics
- News
- Calendar
- Settings

顶部导航：
- 全局资产搜索
- 当前演示市场状态
- 演示数据更新时间
- 主题切换
- 行情颜色切换
- 用户偏好菜单

主内容区：
- 使用统一栅格布局
- 合理安排数据卡片、图表和表格
- 允许侧边栏折叠
- 支持内容区域独立滚动
- 避免页面元素相互遮挡

### 平板端

- 侧边栏可折叠
- 数据卡片自动调整列数
- 图表自适应宽度
- 表格允许局部横向滚动

### 手机端

- 使用移动端导航
- 禁止页面整体横向溢出
- 指标卡片自动换行
- 复杂表格采用卡片或局部滚动
- 弹窗和下拉菜单适配屏幕
- 触控区域尽量不小于 44×44 CSS px

## 六、页面开发要求

### 1. Dashboard

路由：`/`

这是整个网站的核心首页，优先保证视觉质量。

顶部区域：
- 市场概览标题
- 日期
- 演示数据状态
- 更新时间

核心指标卡片：
- S&P 500
- NASDAQ Composite
- Dow Jones
- VIX

每张卡片包含：
- 当前演示数值
- 涨跌点数
- 涨跌百分比
- Sparkline 迷你走势图
- 清晰的涨跌状态

主要图表：
- 市场趋势图
- 时间范围：1D、1W、1M、3M、6M、1Y
- 时间轴和数值轴
- Tooltip
- 当前区间涨跌
- 时间范围切换
- 自适应布局

下方区域：
- 股票涨幅榜
- 股票跌幅榜
- 自选资产
- ETF 行情
- 加密货币行情
- 市场新闻
- 最近查看的资产

所有数据统一来自本地 Mock 数据文件。

切换时间范围时，图表必须实际切换数据序列。

禁止在每次组件渲染时随机生成价格。

### 2. Markets 市场行情

路由：`/markets`

支持资产类别：
- Stocks
- ETFs
- Indices
- Crypto

功能：
- 搜索资产
- 分类筛选
- 按名称排序
- 按价格排序
- 按涨跌幅排序
- 涨幅榜和跌幅榜切换
- 分页
- 点击资产进入详情

表格展示：
- 代码
- 名称
- 类别
- 价格
- 涨跌幅
- 成交量
- Sparkline
- 自选状态

所有筛选和排序都必须真正生效。

### 3. Asset Detail 资产详情

路由：`/assets/:symbol`

页面内容：
- 资产名称和代码
- 资产类别
- 当前演示价格
- 涨跌幅
- 开盘价
- 最高价
- 最低价
- 成交量
- 历史趋势图
- K 线图
- 成交量图
- 技术指标
- 相关资产
- 自选操作

图表功能：
- 时间范围切换
- 分时图和 K 线图切换
- 悬浮十字线
- OHLC 信息展示
- 成交量
- SMA、EMA
- RSI、MACD

技术指标必须通过独立函数基于 Mock 序列计算，不得硬编码一组看似真实的指标结果。

对于不支持的指标、数据不足或未知代码，提供合理提示。

### 4. Watchlist 自选列表

路由：`/watchlist`

功能：
- 查看自选资产
- 添加资产
- 删除资产
- 搜索
- 排序
- 分类筛选
- 点击进入详情
- 显示当前演示价格
- 显示涨跌幅
- 显示迷你趋势图

使用 localStorage 保存用户的自选列表。

刷新浏览器后，自选列表仍然存在。

如果用户删除所有自选资产，显示友好的空状态和添加入口。

避免刷新页面时覆盖用户已经保存的列表。

### 5. Portfolio 投资组合

路由：`/portfolio`

使用本地演示数据，创建一个可以交互的投资组合管理页面。

顶部：
- 总资产
- 持仓市值
- 现金余额
- 当日盈亏
- 累计盈亏

图表：
- 资产配置环形图
- 历史收益曲线
- 持仓分布

持仓表格：
- 资产名称
- 代码
- 持仓数量
- 平均成本
- 当前演示价格
- 市值
- 未实现盈亏
- 收益率

交易管理：
- 添加买入记录
- 添加卖出记录
- 编辑交易
- 删除交易
- 查看交易历史

金融计算：
- 使用移动加权平均成本法
- 正确处理买入、部分卖出和全部卖出
- 单独处理手续费
- 区分已实现与未实现盈亏
- 禁止卖出超过现有持仓的数量
- 禁止负数价格和非法数量
- 保持现金余额计算一致

计算逻辑必须独立于 React 组件，并编写单元测试。

数据只保存在当前浏览器，不得声称已同步到服务器或真实券商账户。

页面醒目显示 DEMO 标识。

### 6. Analytics 风险分析

路由：`/analytics`

展示：
- 累计收益率
- 日收益率
- 年化波动率
- 最大回撤
- 夏普比率
- 资产相关性矩阵
- 资产配置集中度
- 基准对比
- 资产收益贡献度

所有指标通过本地演示序列计算。

必须提供简短的计算口径说明。

历史数据不足时显示数据不足提示，不得生成误导性结果。

### 7. News 市场新闻

路由：`/news`

功能：
- 新闻列表
- 关键词搜索
- 分类筛选
- 日期筛选
- 详情弹窗
- 相关新闻展示

本阶段使用虚构的演示新闻。

每条演示新闻必须有 DEMO 标识，不得伪造真实新闻机构或真实新闻链接。

### 8. Calendar 市场日历

路由：`/calendar`

功能：
- 月历视图
- 上个月和下个月切换
- 经济事件列表
- 事件分类
- 事件详情弹窗
- 日期选择
- 当日事件展示

本阶段使用演示事件，并明确标记为 DEMO。

### 9. Settings 设置

路由：`/settings`

功能：
- 深色主题
- 浅色主题
- 行情颜色方案
- 默认资产类别
- 默认图表时间范围
- 数字格式偏好
- 基础货币选择
- 恢复默认设置

所有设置必须实际影响页面。

使用 localStorage 保存偏好，刷新页面后保持有效。

## 七、统一 Mock 数据系统

建立独立目录：

`src/mocks/`

包含：
- assets.ts
- quotes.ts
- historicalPrices.ts
- candles.ts
- news.ts
- calendar.ts
- portfolio.ts

统一定义 TypeScript 类型：
- Asset
- Quote
- HistoricalPrice
- Candle
- NewsItem
- EconomicEvent
- Portfolio
- PortfolioTransaction

建立统一的数据访问函数，例如：
- getMarketOverview()
- getAssets()
- getAssetBySymbol()
- getHistoricalPrices()
- getCandles()
- getWatchlist()
- getPortfolio()
- getNews()
- getCalendarEvents()

组件禁止直接维护重复的行情数据。

所有演示数据保持稳定，不得每次刷新或渲染都随机改变。

使用统一格式化函数：
- formatPrice()
- formatPercent()
- formatCurrency()
- formatCompactNumber()
- formatDateTime()

不同资产类型使用适当的数字精度。

在应用顶部或显著位置显示：
DEMO DATA — NOT LIVE MARKET DATA

## 八、组件化要求

建立可复用组件：

- AppLayout
- Sidebar
- MobileNavigation
- Topbar
- GlobalSearch
- StatCard
- MiniSparkline
- MarketOverviewChart
- CandlestickChart
- VolumeChart
- AssetTable
- AssetRow
- WatchlistPanel
- AssetAllocationChart
- PortfolioSummary
- TransactionForm
- NewsCard
- CalendarGrid
- ThemeToggle
- MarketColorToggle
- DemoDataBadge
- EmptyState
- LoadingState
- ErrorState
- ConfirmDialog
- Toast
- Tooltip

组件必须有明确职责。

避免将所有页面塞入一个巨大组件。

避免重复实现相同的图表、按钮和表格。

金融计算、数据格式化和 UI 渲染必须分离。

## 九、目录结构

建议采用：

src/
  app/
    router.tsx
  components/
    layout/
    charts/
    market/
    portfolio/
    feedback/
    ui/
  pages/
  mocks/
  services/
  hooks/
  store/
  types/
  utils/
  styles/
    tokens.css
    globals.css

docs/
  DESIGN_SYSTEM.md
  COMPONENTS.md
  TEST_PLAN.md

README.md
.env.example

可根据实际情况调整，但不能把全部逻辑放在单个文件中。

## 十、交互与状态要求

必须实现：
- 路由跳转
- 全局搜索
- 资产详情导航
- 时间范围切换
- 图表切换
- 排序与筛选
- 分页
- 添加和删除自选
- 添加和删除交易
- 主题切换
- 行情颜色切换
- 弹窗
- 表单校验
- 成功和失败 Toast
- 空数据状态
- 未找到资产状态
- 浏览器刷新后的状态恢复

所有按钮和可点击元素都必须具有真实行为。

禁止只添加点击样式而不实现功能。

## 十一、测试和质量验收

使用 Vitest 对以下功能编写测试：

- 金融计算
- 持仓成本
- 买入与卖出
- 已实现盈亏
- 未实现盈亏
- 最大回撤
- 收益率
- 技术指标
- Mock 数据结构
- 资产搜索和筛选
- localStorage 状态管理

如果当前环境支持 Playwright，则进行浏览器端检查。

至少检查以下尺寸：
- 1440×900
- 1280×800
- 768×1024
- 390×844

重点检查：
- 页面是否出现横向溢出
- 导航是否正常
- 图表是否完整
- 弹窗是否超出屏幕
- 表格是否可读
- 主题切换是否完整
- 浏览器控制台是否存在错误

不能通过关闭测试或隐藏错误来宣称项目通过验收。

## 十二、执行流程

第一步：检查现有项目和 ui-ux-pro-max-skill。

第二步：确定并记录设计系统。

第三步：搭建 React、TypeScript 和 Vite 项目。

第四步：完成统一布局、导航和设计组件。

第五步：优先完成 Dashboard 的视觉质量和交互。

第六步：完成 Markets、资产详情和 Watchlist。

第七步：完成 Portfolio 和 Analytics。

第八步：完成 News、Calendar 和 Settings。

第九步：完成响应式设计和全局视觉统一。

第十步：执行测试、运行构建、检查页面并修复错误。

第十一步：完善 README、设计规范和测试报告。

如果任务过大，优先保证核心页面高质量，再继续其他页面。不要为了快速完成而生成大量未经验证的代码。

遇到错误时，先定位原因，再修复。

不要删除现有项目文件或覆盖未知配置。

## 十三、最终交付要求

最终提供：
- 完整前端源代码
- 可复用 UI 组件
- 统一 Mock 数据
- 九个可访问的页面
- 可交互的金融图表
- 可用的自选列表
- 可操作的演示投资组合
- 完整的深色和浅色主题
- 响应式布局
- 单元测试
- README.md
- DESIGN_SYSTEM.md
- COMPONENTS.md
- TEST_PLAN.md

最终报告必须说明：
1. 已完成的功能。
2. 实际运行和测试结果。
3. 尚未完成的功能。
4. 项目启动命令。
5. 关键文件所在位置。
6. 如何继续扩展前端。

现在开始执行。不要只输出计划，不要只生成首页，不要开发任何后端。必须创建真实项目文件、运行项目、测试交互并修复发现的问题。