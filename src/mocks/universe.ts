import type { Asset, Exchange } from '@/types';

export interface AssetSeed extends Asset {
  basePrice: number;
  drift: number;
  volatility: number;
  baseVolume: number;
  marketCap: number;
}

const stock = (
  symbol: string,
  name: string,
  sector: string,
  basePrice: number,
  marketCap: number,
  baseVolume: number,
  drift: number,
  volatility: number,
  description: string,
  exchange: Exchange = 'NASDAQ',
): AssetSeed => ({
  symbol,
  name,
  class: 'stock',
  exchange,
  sector,
  currency: 'USD',
  description,
  basePrice,
  drift,
  volatility,
  baseVolume,
  marketCap,
});

const etf = (
  symbol: string,
  name: string,
  sector: string,
  basePrice: number,
  marketCap: number,
  baseVolume: number,
  drift: number,
  volatility: number,
  description: string,
  exchange: Exchange = 'ARCA',
): AssetSeed => ({
  symbol,
  name,
  class: 'etf',
  exchange,
  sector,
  currency: 'USD',
  description,
  basePrice,
  drift,
  volatility,
  baseVolume,
  marketCap,
});

const index = (
  symbol: string,
  name: string,
  basePrice: number,
  drift: number,
  volatility: number,
  description: string,
  baseVolume = 0,
): AssetSeed => ({
  symbol,
  name,
  class: 'index',
  exchange: 'NYSE',
  sector: 'Index',
  currency: 'USD',
  description,
  basePrice,
  drift,
  volatility,
  baseVolume,
  marketCap: 0,
});

const crypto = (
  symbol: string,
  name: string,
  basePrice: number,
  marketCap: number,
  baseVolume: number,
  drift: number,
  volatility: number,
  description: string,
): AssetSeed => ({
  symbol,
  name,
  class: 'crypto',
  exchange: 'CRYPTO',
  sector: 'Digital Assets',
  currency: 'USD',
  description,
  basePrice,
  drift,
  volatility,
  baseVolume,
  marketCap,
});

export const ASSET_SEEDS: AssetSeed[] = [
  stock('AAPL', 'Apple Inc.', 'Technology', 232.14, 3_512_000_000_000, 52_400_000, 0.22, 0.019, 'Consumer hardware, software and services ecosystem.'),
  stock('MSFT', 'Microsoft Corp.', 'Technology', 428.66, 3_186_000_000_000, 21_800_000, 0.24, 0.017, 'Cloud infrastructure, productivity software and AI platforms.'),
  stock('NVDA', 'NVIDIA Corp.', 'Semiconductors', 187.42, 4_562_000_000_000, 198_000_000, 0.42, 0.031, 'Accelerated computing, GPU and AI data-centre platforms.'),
  stock('AMZN', 'Amazon.com Inc.', 'Consumer Discretionary', 214.35, 2_264_000_000_000, 38_600_000, 0.19, 0.021, 'E-commerce marketplace, logistics and AWS cloud services.'),
  stock('GOOGL', 'Alphabet Inc. Class A', 'Communication Services', 201.87, 2_438_000_000_000, 28_400_000, 0.18, 0.019, 'Search, advertising, YouTube and Google Cloud.'),
  stock('META', 'Meta Platforms Inc.', 'Communication Services', 612.4, 1_552_000_000_000, 14_200_000, 0.26, 0.024, 'Social platforms, advertising and Reality Labs.'),
  stock('TSLA', 'Tesla Inc.', 'Consumer Discretionary', 421.18, 1_354_000_000_000, 96_800_000, 0.11, 0.038, 'Electric vehicles, energy storage and autonomy software.'),
  stock('AVGO', 'Broadcom Inc.', 'Semiconductors', 178.92, 836_000_000_000, 26_400_000, 0.31, 0.026, 'Semiconductors and infrastructure software.'),
  stock('JPM', 'JPMorgan Chase & Co.', 'Financials', 246.31, 692_000_000_000, 9_800_000, 0.14, 0.014, 'Global banking, markets and asset management.', 'NYSE'),
  stock('V', 'Visa Inc.', 'Financials', 312.55, 608_000_000_000, 6_400_000, 0.13, 0.013, 'Global payments network and value-added services.', 'NYSE'),
  stock('JNJ', 'Johnson & Johnson', 'Healthcare', 158.2, 382_000_000_000, 7_200_000, 0.06, 0.012, 'Pharmaceuticals and medical technology.', 'NYSE'),
  stock('XOM', 'Exxon Mobil Corp.', 'Energy', 118.74, 514_000_000_000, 14_600_000, 0.08, 0.016, 'Integrated energy, upstream and downstream operations.', 'NYSE'),
  stock('UNH', 'UnitedHealth Group', 'Healthcare', 512.34, 472_000_000_000, 4_100_000, 0.05, 0.018, 'Health benefits and healthcare services.', 'NYSE'),
  stock('PG', 'Procter & Gamble', 'Consumer Staples', 168.42, 396_000_000_000, 6_900_000, 0.05, 0.011, 'Household and personal care brands.', 'NYSE'),
  stock('MA', 'Mastercard Inc.', 'Financials', 528.6, 486_000_000_000, 3_200_000, 0.14, 0.013, 'Global payments and data services.', 'NYSE'),
  stock('HD', 'Home Depot Inc.', 'Consumer Discretionary', 402.17, 398_000_000_000, 3_800_000, 0.09, 0.014, 'Home improvement retail.', 'NYSE'),
  stock('COST', 'Costco Wholesale', 'Consumer Staples', 912.45, 404_000_000_000, 2_100_000, 0.16, 0.013, 'Membership warehouse retail.', 'NASDAQ'),
  stock('ORCL', 'Oracle Corp.', 'Technology', 182.36, 508_000_000_000, 12_400_000, 0.28, 0.021, 'Database, cloud infrastructure and enterprise applications.', 'NYSE'),
  stock('AMD', 'Advanced Micro Devices', 'Semiconductors', 158.92, 258_000_000_000, 46_200_000, 0.27, 0.032, 'CPUs, GPUs and adaptive computing.', 'NASDAQ'),
  stock('NFLX', 'Netflix Inc.', 'Communication Services', 812.55, 348_000_000_000, 3_900_000, 0.24, 0.022, 'Streaming entertainment and advertising.', 'NASDAQ'),
  stock('CRM', 'Salesforce Inc.', 'Technology', 268.4, 256_000_000_000, 7_600_000, 0.12, 0.021, 'Customer relationship management and data cloud.', 'NYSE'),
  stock('ADBE', 'Adobe Inc.', 'Technology', 486.22, 214_000_000_000, 3_400_000, 0.08, 0.022, 'Creative, document and experience cloud software.', 'NASDAQ'),
  stock('QCOM', 'Qualcomm Inc.', 'Semiconductors', 168.35, 186_000_000_000, 10_200_000, 0.15, 0.024, 'Mobile processors, modems and licensing.', 'NASDAQ'),
  stock('INTC', 'Intel Corp.', 'Semiconductors', 24.86, 108_000_000_000, 84_000_000, -0.06, 0.028, 'Client computing, data centre and foundry.', 'NASDAQ'),
  stock('PFE', 'Pfizer Inc.', 'Healthcare', 28.42, 162_000_000_000, 32_400_000, 0.03, 0.015, 'Biopharmaceutical research and products.', 'NYSE'),
  stock('KO', 'Coca-Cola Co.', 'Consumer Staples', 62.18, 268_000_000_000, 14_800_000, 0.05, 0.01, 'Global beverage brands.', 'NYSE'),
  stock('PEP', 'PepsiCo Inc.', 'Consumer Staples', 168.75, 232_000_000_000, 5_600_000, 0.04, 0.011, 'Beverages and convenient foods.', 'NASDAQ'),
  stock('CSCO', 'Cisco Systems', 'Technology', 58.34, 232_000_000_000, 18_600_000, 0.09, 0.014, 'Networking, security and collaboration infrastructure.', 'NASDAQ'),
  stock('WMT', 'Walmart Inc.', 'Consumer Staples', 92.48, 742_000_000_000, 16_200_000, 0.13, 0.012, 'Global omnichannel retail.', 'NYSE'),
  stock('DIS', 'Walt Disney Co.', 'Communication Services', 108.62, 198_000_000_000, 12_800_000, 0.06, 0.017, 'Parks, studios and streaming.', 'NYSE'),

  etf('SPY', 'SPDR S&P 500 ETF Trust', 'Broad Market', 598.42, 612_000_000_000, 68_400_000, 0.12, 0.009, 'Tracks the S&P 500 index.'),
  etf('QQQ', 'Invesco QQQ Trust', 'Broad Market', 512.36, 324_000_000_000, 42_200_000, 0.15, 0.012, 'Tracks the Nasdaq-100 index.'),
  etf('IWM', 'iShares Russell 2000 ETF', 'Small Cap', 228.64, 68_000_000_000, 28_600_000, 0.08, 0.014, 'Tracks the Russell 2000 small-cap index.'),
  etf('DIA', 'SPDR Dow Jones ETF', 'Broad Market', 442.18, 38_000_000_000, 3_400_000, 0.09, 0.009, 'Tracks the Dow Jones Industrial Average.'),
  etf('VTI', 'Vanguard Total Stock Market ETF', 'Broad Market', 296.42, 486_000_000_000, 4_200_000, 0.12, 0.009, 'Total US equity market exposure.'),
  etf('VOO', 'Vanguard S&P 500 ETF', 'Broad Market', 549.8, 528_000_000_000, 6_400_000, 0.12, 0.009, 'Low-cost S&P 500 index exposure.'),
  etf('ARKK', 'ARK Innovation ETF', 'Thematic', 48.62, 6_200_000_000, 9_800_000, -0.02, 0.026, 'Disruptive innovation thematic fund.'),
  etf('GLD', 'SPDR Gold Shares', 'Commodities', 246.35, 72_000_000_000, 7_200_000, 0.10, 0.011, 'Physical gold bullion exposure.'),
  etf('TLT', 'iShares 20+ Year Treasury Bond ETF', 'Fixed Income', 92.48, 48_000_000_000, 32_400_000, -0.03, 0.012, 'Long-duration US Treasury exposure.'),
  etf('XLE', 'Energy Select Sector SPDR', 'Sector', 96.12, 36_000_000_000, 14_200_000, 0.06, 0.015, 'US energy sector exposure.'),
  etf('XLK', 'Technology Select Sector SPDR', 'Sector', 248.36, 78_000_000_000, 8_600_000, 0.18, 0.014, 'US technology sector exposure.'),
  etf('XLF', 'Financial Select Sector SPDR', 'Sector', 48.92, 42_000_000_000, 36_800_000, 0.11, 0.011, 'US financials sector exposure.'),
  etf('EEM', 'iShares MSCI Emerging Markets ETF', 'International', 44.86, 18_000_000_000, 24_200_000, 0.04, 0.013, 'Emerging market equity exposure.'),
  etf('VNQ', 'Vanguard Real Estate ETF', 'Real Estate', 92.34, 32_000_000_000, 5_400_000, 0.03, 0.013, 'US real estate investment trusts.'),
  etf('SMH', 'VanEck Semiconductor ETF', 'Sector', 268.42, 26_000_000_000, 9_600_000, 0.24, 0.022, 'Global semiconductor leaders.'),

  index('SPX', 'S&P 500 Index', 6842.35, 0.12, 0.008, 'Large-cap US equity benchmark.', 2_840_000_000),
  index('IXIC', 'NASDAQ Composite', 23428.6, 0.16, 0.011, 'Technology-heavy US composite index.', 4_620_000_000),
  index('DJI', 'Dow Jones Industrial Average', 47218.42, 0.08, 0.007, 'Price-weighted US blue-chip index.', 382_000_000),
  index('RUT', 'Russell 2000 Index', 2412.36, 0.07, 0.012, 'US small-cap equity benchmark.', 724_000_000),
  index('VIX', 'CBOE Volatility Index', 16.42, -0.02, 0.06, 'Implied volatility of S&P 500 options.', 0),

  crypto('BTC-USD', 'Bitcoin', 112480, 2_214_000_000_000, 38_600_000_000, 0.36, 0.032, 'The largest proof-of-work digital asset.'),
  crypto('ETH-USD', 'Ethereum', 4128.6, 498_000_000_000, 21_400_000_000, 0.28, 0.038, 'Smart-contract platform and settlement asset.'),
  crypto('SOL-USD', 'Solana', 218.42, 118_000_000_000, 4_860_000_000, 0.32, 0.046, 'High-throughput smart-contract network.'),
  crypto('XRP-USD', 'XRP', 2.68, 154_000_000_000, 2_140_000_000, 0.12, 0.041, 'Payment-focused digital asset.'),
  crypto('ADA-USD', 'Cardano', 0.92, 32_800_000_000, 682_000_000, 0.02, 0.043, 'Proof-of-stake smart-contract platform.'),
  crypto('DOGE-USD', 'Dogecoin', 0.2142, 31_600_000_000, 1_280_000_000, 0.04, 0.052, 'Community-driven digital currency.'),
  crypto('AVAX-USD', 'Avalanche', 32.48, 13_400_000_000, 468_000_000, 0.08, 0.047, 'Subnet-based smart-contract network.'),
  crypto('LINK-USD', 'Chainlink', 22.36, 14_200_000_000, 724_000_000, 0.14, 0.045, 'Decentralised oracle network.'),
];

export const INDEX_OVERVIEW_SYMBOLS = ['SPX', 'IXIC', 'DJI', 'VIX'];

export const DEFAULT_WATCHLIST = ['AAPL', 'NVDA', 'SPY', 'BTC-USD', 'TSLA', 'GLD'];

export const RECENTLY_VIEWED_SEED = ['SPX', 'NVDA', 'AAPL', 'ETH-USD'];
