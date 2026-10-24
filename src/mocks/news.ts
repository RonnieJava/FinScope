import type { NewsItem } from '@/types';
import { DEMO_NOW } from '@/utils/date';

const hoursAgo = (hours: number): string =>
  new Date(DEMO_NOW.getTime() - hours * 3600_000).toISOString();

const body = (paragraphs: string[]): string => paragraphs.join('\n\n');

export const NEWS_ITEMS: NewsItem[] = [
  {
    id: 'news-001',
    title: 'Mega-cap technology leads a broad afternoon bid',
    summary:
      'Demo tape: semiconductors and software names extended gains into the close while defensive sectors lagged the benchmark.',
    body: body([
      'This is fictional demo content created for FinScope. It does not describe real market activity.',
      'A basket of large-cap technology names carried the demo index higher through the afternoon session, with semiconductor constituents contributing the largest share of the move. Breadth improved as the session progressed, though utilities and consumer staples finished modestly lower.',
      'Traders in the simulation are watching whether the advance is confirmed by volume. The demo volume profile shows participation concentrated in the final two hours, a pattern that often appears in momentum-driven sessions.',
      'FinScope computes every number on this page from local demo series. No live market feed is connected.',
    ]),
    category: 'Markets',
    source: 'FinScope Demo Wire',
    publishedAt: hoursAgo(0.4),
    symbols: ['SPX', 'IXIC', 'NVDA', 'MSFT'],
    isDemo: true,
    readTimeMin: 2,
  },
  {
    id: 'news-002',
    title: 'Demo Fed minutes point to a cautious easing path',
    summary:
      'The fictional minutes describe a committee split between patience and concern about slowing demand.',
    body: body([
      'Demo summary: policymakers in this simulated release debated how quickly to normalize policy as inflation measures drifted toward target.',
      'Several participants emphasised that any easing should be gradual and data-dependent. Others highlighted softening in manufacturing surveys as a reason to move sooner.',
      'The demo rate path implied by the calendar remains unchanged. All events shown in FinScope are synthetic and marked DEMO.',
    ]),
    category: 'Policy',
    source: 'Demo Macro Notes',
    publishedAt: hoursAgo(2.1),
    symbols: ['SPX', 'TLT'],
    isDemo: true,
    readTimeMin: 3,
  },
  {
    id: 'news-003',
    title: 'Bitcoin holds a tight range as funding normalises',
    summary:
      'Perpetual funding in the demo dataset cooled to neutral after a stretch of positive carry.',
    body: body([
      'In this simulated crypto session, bitcoin traded in a narrow band while perpetual funding rates returned toward neutral territory.',
      'The demo order-flow model shows balanced buying and selling across the last six hours, with spot volume slightly below the twenty-day average.',
      'FinScope does not connect to exchanges. Crypto quotes and candles are generated locally for demonstration purposes only.',
    ]),
    category: 'Crypto',
    source: 'Demo Crypto Ledger',
    publishedAt: hoursAgo(3.4),
    symbols: ['BTC-USD', 'ETH-USD'],
    isDemo: true,
    readTimeMin: 2,
  },
  {
    id: 'news-004',
    title: 'Demo earnings preview: cloud spending stays resilient',
    summary:
      'A synthetic preview suggests enterprise cloud budgets remain stable while hardware refresh cycles stay uneven.',
    body: body([
      'This preview is fictional. It uses FinScope demo data and should not be treated as investment research.',
      'The demo survey panel shows cloud optimisation projects continuing, with new AI workloads offsetting some cost discipline. Hardware commentary is more mixed, particularly for legacy server refresh cycles.',
      'Margins remain the key swing factor in the simulation: higher compute costs could pressure gross margin even as revenue holds.',
    ]),
    category: 'Earnings',
    source: 'FinScope Demo Wire',
    publishedAt: hoursAgo(5.2),
    symbols: ['MSFT', 'AMZN', 'GOOGL', 'ORCL'],
    isDemo: true,
    readTimeMin: 3,
  },
  {
    id: 'news-005',
    title: 'Demo inflation print lands slightly below forecast',
    summary:
      'The simulated core measure eased, nudging the demo rate-cut probability higher on the calendar page.',
    body: body([
      'Demo data: the fictional core inflation index rose less than the consensus forecast embedded in FinScope.',
      'Bond proxies firmed after the release while the demo dollar index slipped. Rate-sensitive equity sectors outperformed in the simulated session.',
      'The release is part of a synthetic dataset. Values, forecasts and reactions are produced locally and labelled DEMO throughout the interface.',
    ]),
    category: 'Economy',
    source: 'Demo Macro Notes',
    publishedAt: hoursAgo(7.8),
    symbols: ['TLT', 'GLD', 'SPX'],
    isDemo: true,
    readTimeMin: 2,
  },
  {
    id: 'news-006',
    title: 'ETF flows favour broad-market exposure in the demo tape',
    summary:
      'Synthetic flow estimates show steady allocations to core index funds with selective sector rotation.',
    body: body([
      'FinScope demo flow estimates show core broad-market ETFs attracting the largest share of simulated allocations.',
      'Sector funds were mixed: technology and semiconductors saw inflows, while energy and real estate recorded modest outflows.',
      'Flow figures are modelled from local demo volume data and do not represent actual fund flows.',
    ]),
    category: 'Markets',
    source: 'FinScope Demo Wire',
    publishedAt: hoursAgo(9.5),
    symbols: ['SPY', 'QQQ', 'VOO', 'SMH'],
    isDemo: true,
    readTimeMin: 2,
  },
  {
    id: 'news-007',
    title: 'Demo volatility gauge slips as hedging demand fades',
    summary:
      'The simulated VIX series declined for a second session, though it remains above its one-year demo average.',
    body: body([
      'The demo volatility index moved lower as simulated options demand for downside protection eased.',
      'FinScope computes the demo VIX series from a synthetic quote set. It is not derived from live options markets.',
      'A lower reading typically signals a calmer implied backdrop, but the demo dataset still shows elevated dispersion across single names.',
    ]),
    category: 'Markets',
    source: 'Demo Market Desk',
    publishedAt: hoursAgo(11.2),
    symbols: ['VIX', 'SPX'],
    isDemo: true,
    readTimeMin: 1,
  },
  {
    id: 'news-008',
    title: 'Semiconductor equipment orders steady in demo survey',
    summary:
      'A fictional supply-chain panel reports stable lead times and improving utilisation.',
    body: body([
      'The demo supply-chain panel shows semiconductor equipment lead times stabilising after several quarters of volatility.',
      'Utilisation improved across advanced packaging lines, according to the synthetic survey. Memory pricing remains the main divergent signal.',
      'All survey values are generated for demonstration and are not sourced from real companies.',
    ]),
    category: 'Technology',
    source: 'Demo Supply Chain Brief',
    publishedAt: hoursAgo(13.6),
    symbols: ['NVDA', 'AMD', 'AVGO', 'SMH'],
    isDemo: true,
    readTimeMin: 3,
  },
  {
    id: 'news-009',
    title: 'Demo retail sales beat as consumers prioritise services',
    summary:
      'The simulated release shows services spending offsetting softer goods categories.',
    body: body([
      'Fictional retail data in the FinScope dataset came in above forecast, led by services and dining categories.',
      'Discretionary goods were mixed. The demo consumer-strength index ticked higher for a third consecutive reading.',
      'This article is demo content. FinScope is a front-end demonstration project with no live economic feed.',
    ]),
    category: 'Economy',
    source: 'Demo Macro Notes',
    publishedAt: hoursAgo(16.4),
    symbols: ['SPX', 'AMZN', 'WMT'],
    isDemo: true,
    readTimeMin: 2,
  },
  {
    id: 'news-010',
    title: 'Ethereum demo network activity edges higher',
    summary:
      'Synthetic on-chain metrics show a modest increase in active addresses and settlement value.',
    body: body([
      'In the demo dataset, Ethereum network activity improved week over week, with active addresses and settlement value both slightly higher.',
      'Fee revenue remained range-bound. Validator participation was stable in the simulation.',
      'No live blockchain data is queried by FinScope. Crypto metrics are illustrative only.',
    ]),
    category: 'Crypto',
    source: 'Demo Crypto Ledger',
    publishedAt: hoursAgo(19.1),
    symbols: ['ETH-USD', 'LINK-USD'],
    isDemo: true,
    readTimeMin: 2,
  },
  {
    id: 'news-011',
    title: 'Demo banks prepare for a steeper deposit curve',
    summary:
      'A fictional sector note explores net interest margin scenarios under two demo rate paths.',
    body: body([
      'The demo note models bank net interest margins under a gradual easing path and a faster one.',
      'In both scenarios, deposit repricing is the dominant variable. Credit costs remain contained in the synthetic base case.',
      'FinScope demo research is not investment advice and does not reflect the views of any real institution.',
    ]),
    category: 'Earnings',
    source: 'Demo Market Desk',
    publishedAt: hoursAgo(22.7),
    symbols: ['JPM', 'XLF', 'V', 'MA'],
    isDemo: true,
    readTimeMin: 3,
  },
  {
    id: 'news-012',
    title: 'Gold firms as the demo dollar softens',
    summary:
      'The synthetic gold series advanced while real yields eased in the demo rate model.',
    body: body([
      'Demo gold prices moved higher as the simulated dollar index softened and real yields edged lower.',
      'The move was orderly, with volume close to the twenty-day demo average. Silver and platinum proxies followed.',
      'FinScope commodity quotes are synthetic and are shown for interface demonstration only.',
    ]),
    category: 'Markets',
    source: 'FinScope Demo Wire',
    publishedAt: hoursAgo(26.3),
    symbols: ['GLD', 'XLE'],
    isDemo: true,
    readTimeMin: 1,
  },
  {
    id: 'news-013',
    title: 'Demo policy panel debates stablecoin safeguards',
    summary:
      'A fictional policy roundtable discusses reserve transparency and settlement finality.',
    body: body([
      'This demo policy brief summarises a fictional roundtable on digital-asset settlement safeguards.',
      'Participants focused on reserve disclosure standards and the treatment of tokenised deposits. No jurisdictional decision was reached in the simulation.',
      'FinScope publishes synthetic news only. Sources, quotes and events are fictional.',
    ]),
    category: 'Policy',
    source: 'Demo Policy Brief',
    publishedAt: hoursAgo(30.6),
    symbols: ['BTC-USD', 'XRP-USD', 'SOL-USD'],
    isDemo: true,
    readTimeMin: 4,
  },
  {
    id: 'news-014',
    title: 'Demo small caps lag as financing costs bite',
    summary:
      'The synthetic Russell 2000 series underperformed large caps for a third session.',
    body: body([
      'Small-cap demo indices lagged their large-cap peers as the simulated financing-cost model stayed restrictive.',
      'Sector dispersion was wide. Industrials and regional banks were the weakest cohorts in the demo dataset.',
      'All index values are generated locally by FinScope for demonstration.',
    ]),
    category: 'Markets',
    source: 'Demo Market Desk',
    publishedAt: hoursAgo(34.2),
    symbols: ['RUT', 'IWM', 'SPX'],
    isDemo: true,
    readTimeMin: 2,
  },
];

export function getMockNews(): NewsItem[] {
  return NEWS_ITEMS;
}
