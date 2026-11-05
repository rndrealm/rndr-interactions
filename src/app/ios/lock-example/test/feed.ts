// Fake price alerts for the list: USDC, ETH, AAVE, BTC, USDT and HYPE always
// fill the top six, in that order, and random coins fill the rest. The first
// feed comes from a fixed seed so the server and the client render the same
// thing (no hydration mismatch); each pull to refresh draws new numbers.

export type TokenSymbol =
  | "USDC"
  | "ETH"
  | "AAVE"
  | "BTC"
  | "USDT"
  | "HYPE"
  | "SOL"
  | "LINK"
  | "DAI"
  | "AVAX";

export type Alert = {
  id: string;
  symbol: TokenSymbol;
  title: string;
  detail: string;
  minutesAgo: number;
};

const FEED_LENGTH = 10;

const PRICES: Record<TokenSymbol, number> = {
  USDC: 0.998,
  ETH: 3412,
  AAVE: 268.4,
  BTC: 68420,
  USDT: 1.0,
  HYPE: 38.7,
  SOL: 162.4,
  LINK: 14.82,
  DAI: 0.999,
  AVAX: 28.6,
};

// Always the top six, in this order, USDC first
const PINNED: TokenSymbol[] = ["USDC", "ETH", "AAVE", "BTC", "USDT", "HYPE"];
// The rest of the list is filled at random from these
const FILL: TokenSymbol[] = ["SOL", "LINK", "DAI", "AVAX", "ETH", "BTC"];
const STABLE: TokenSymbol[] = ["USDC", "USDT", "DAI"];

// Small seeded random (mulberry32), so a seed always gives the same feed
const random = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const formatPrice = (value: number, stable: boolean) =>
  `$${value.toLocaleString("en-US", {
    minimumFractionDigits: stable ? 3 : 2,
    maximumFractionDigits: stable ? 3 : 2,
  })}`;

export const formatAge = (minutes: number) =>
  minutes === 0
    ? "now"
    : minutes < 60
      ? `${minutes} min ago`
      : `${Math.floor(minutes / 60)} hr ago`;

const makeAlert = (
  next: () => number,
  symbol: TokenSymbol,
  minutesAgo: number,
  id: string,
): Alert => {
  const stable = STABLE.includes(symbol);
  // Stablecoins barely move; everything else swings a few percent
  const change =
    (stable ? 0.1 + next() * 0.6 : 0.5 + next() * 6) * (next() < 0.5 ? -1 : 1);
  const price = PRICES[symbol] * (1 + change / 100);
  const kind = next();

  const title =
    kind < 0.6
      ? `${symbol} moved by ${Math.abs(change).toFixed(1)}%`
      : kind < 0.8
        ? `${symbol} ${change > 0 ? "up" : "down"} ${Math.abs(change).toFixed(1)}% today`
        : `${symbol} hit a 24h ${change > 0 ? "high" : "low"}`;

  return {
    id,
    symbol,
    title,
    detail: `${symbol} at ${formatPrice(price, stable)}`,
    minutesAgo,
  };
};

// The pinned six first, then random coins to fill the list, with ages
// getting older down the list
const makeFeed = (seed: number) => {
  const next = random(seed);
  let minutes = 0;
  return Array.from({ length: FEED_LENGTH }, (_, index) => {
    const symbol = PINNED[index] ?? FILL[Math.floor(next() * FILL.length)];
    const alert = makeAlert(next, symbol, minutes, `${seed}-${index}`);
    minutes += 1 + Math.floor(next() * 6);
    return alert;
  });
};

export const initialFeed = makeFeed(1);

// A refresh: new numbers and times for every row, same order on top
export const refreshFeed = () => makeFeed(Date.now());
