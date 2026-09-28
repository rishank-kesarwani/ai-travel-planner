export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  rateFromUsd: number;
  minBudget: number;
  maxBudget: number;
  step: number;
  defaultBudget: number;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyInfo> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    flag: '🇮🇳',
    rateFromUsd: 83.5,
    minBudget: 10000,
    maxBudget: 800000,
    step: 5000,
    defaultBudget: 60000,
  },
  THB: {
    code: 'THB',
    symbol: '฿',
    name: 'Thai Baht',
    flag: '🇹🇭',
    rateFromUsd: 36.5,
    minBudget: 5000,
    maxBudget: 350000,
    step: 2000,
    defaultBudget: 30000,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    flag: '🇺🇸',
    rateFromUsd: 1.0,
    minBudget: 300,
    maxBudget: 10000,
    step: 100,
    defaultBudget: 1500,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    flag: '🇪🇺',
    rateFromUsd: 0.92,
    minBudget: 300,
    maxBudget: 9000,
    step: 100,
    defaultBudget: 1400,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    flag: '🇬🇧',
    rateFromUsd: 0.78,
    minBudget: 250,
    maxBudget: 8000,
    step: 100,
    defaultBudget: 1200,
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    flag: '🇯🇵',
    rateFromUsd: 155.0,
    minBudget: 40000,
    maxBudget: 1500000,
    step: 10000,
    defaultBudget: 200000,
  },
  AED: {
    code: 'AED',
    symbol: 'AED',
    name: 'UAE Dirham',
    flag: '🇦🇪',
    rateFromUsd: 3.67,
    minBudget: 1000,
    maxBudget: 35000,
    step: 500,
    defaultBudget: 5500,
  },
  CAD: {
    code: 'CAD',
    symbol: 'CA$',
    name: 'Canadian Dollar',
    flag: '🇨🇦',
    rateFromUsd: 1.36,
    minBudget: 400,
    maxBudget: 13000,
    step: 100,
    defaultBudget: 2000,
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    flag: '🇦🇺',
    rateFromUsd: 1.52,
    minBudget: 450,
    maxBudget: 15000,
    step: 100,
    defaultBudget: 2200,
  },
  SGD: {
    code: 'SGD',
    symbol: 'S$',
    name: 'Singapore Dollar',
    flag: '🇸🇬',
    rateFromUsd: 1.35,
    minBudget: 400,
    maxBudget: 13500,
    step: 100,
    defaultBudget: 2000,
  },
};

export const DEFAULT_CURRENCY = 'INR';

export function getCurrency(code?: string): CurrencyInfo {
  if (!code) return SUPPORTED_CURRENCIES[DEFAULT_CURRENCY];
  const upper = code.toUpperCase().trim();
  return SUPPORTED_CURRENCIES[upper] || SUPPORTED_CURRENCIES[DEFAULT_CURRENCY];
}

export function formatPrice(amount: number, currencyCode?: string): string {
  const curr = getCurrency(currencyCode);
  return `${curr.symbol}${Math.round(amount).toLocaleString()}`;
}

export function convertFromUsd(amountUsd: number, targetCurrency?: string): number {
  const curr = getCurrency(targetCurrency);
  return Math.round(amountUsd * curr.rateFromUsd);
}

export function convertBetweenCurrencies(amount: number, fromCurrency: string, toCurrency: string): number {
  const from = getCurrency(fromCurrency);
  const to = getCurrency(toCurrency);
  const inUsd = amount / from.rateFromUsd;
  return Math.round(inUsd * to.rateFromUsd);
}

export function detectCurrencyFromBrowserTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone?.toLowerCase() || '';
    if (tz.includes('calcutta') || tz.includes('kolkata') || tz.includes('india')) return 'INR';
    if (tz.includes('bangkok') || tz.includes('thailand')) return 'THB';
    if (tz.includes('tokyo') || tz.includes('japan')) return 'JPY';
    if (tz.includes('dubai')) return 'AED';
    if (tz.includes('london')) return 'GBP';
    if (tz.includes('paris') || tz.includes('rome') || tz.includes('berlin') || tz.includes('athens') || tz.includes('madrid')) return 'EUR';
    if (tz.includes('toronto') || tz.includes('vancouver') || tz.includes('edmonton')) return 'CAD';
    if (tz.includes('sydney') || tz.includes('melbourne')) return 'AUD';
    if (tz.includes('singapore')) return 'SGD';
    if (tz.includes('new_york') || tz.includes('los_angeles') || tz.includes('chicago') || tz.includes('america')) return 'USD';
  } catch (e) {
    // ignore
  }
  return DEFAULT_CURRENCY;
}

export function detectCurrencyFromDestination(destination: string): string {
  if (!destination) return DEFAULT_CURRENCY;
  const lower = destination.toLowerCase().trim();

  // India
  if (
    lower.includes('india') ||
    lower.includes('mussoorie') ||
    lower.includes('delhi') ||
    lower.includes('mumbai') ||
    lower.includes('goa') ||
    lower.includes('manali') ||
    lower.includes('jaipur') ||
    lower.includes('bengaluru') ||
    lower.includes('bangalore') ||
    lower.includes('kerala') ||
    lower.includes('shimla') ||
    lower.includes('rishikesh') ||
    lower.includes('kolkata') ||
    lower.includes('chennai') ||
    lower.includes('agra') ||
    lower.includes('varanasi') ||
    lower.includes('ladakh')
  ) {
    return 'INR';
  }

  // Thailand
  if (
    lower.includes('thailand') ||
    lower.includes('phuket') ||
    lower.includes('bangkok') ||
    lower.includes('pattaya') ||
    lower.includes('krabi') ||
    lower.includes('chiang mai') ||
    lower.includes('koh samui') ||
    lower.includes('phi phi')
  ) {
    return 'THB';
  }

  // Japan
  if (
    lower.includes('japan') ||
    lower.includes('kyoto') ||
    lower.includes('tokyo') ||
    lower.includes('osaka') ||
    lower.includes('hokkaido') ||
    lower.includes('hiroshima') ||
    lower.includes('nara')
  ) {
    return 'JPY';
  }

  // UAE
  if (
    lower.includes('uae') ||
    lower.includes('dubai') ||
    lower.includes('abu dhabi') ||
    lower.includes('sharjah')
  ) {
    return 'AED';
  }

  // UK
  if (
    lower.includes('uk') ||
    lower.includes('united kingdom') ||
    lower.includes('london') ||
    lower.includes('england') ||
    lower.includes('scotland') ||
    lower.includes('edinburgh')
  ) {
    return 'GBP';
  }

  // Europe
  if (
    lower.includes('italy') ||
    lower.includes('rome') ||
    lower.includes('florence') ||
    lower.includes('venice') ||
    lower.includes('france') ||
    lower.includes('paris') ||
    lower.includes('greece') ||
    lower.includes('santorini') ||
    lower.includes('germany') ||
    lower.includes('berlin') ||
    lower.includes('spain') ||
    lower.includes('barcelona') ||
    lower.includes('madrid') ||
    lower.includes('netherlands') ||
    lower.includes('amsterdam')
  ) {
    return 'EUR';
  }

  // Canada
  if (
    lower.includes('canada') ||
    lower.includes('banff') ||
    lower.includes('toronto') ||
    lower.includes('vancouver')
  ) {
    return 'CAD';
  }

  // Singapore
  if (lower.includes('singapore')) return 'SGD';

  // Australia
  if (
    lower.includes('australia') ||
    lower.includes('sydney') ||
    lower.includes('melbourne')
  ) {
    return 'AUD';
  }

  // USA
  if (
    lower.includes('usa') ||
    lower.includes('united states') ||
    lower.includes('new york') ||
    lower.includes('california') ||
    lower.includes('san francisco') ||
    lower.includes('los angeles') ||
    lower.includes('hawaii')
  ) {
    return 'USD';
  }

  return DEFAULT_CURRENCY;
}
