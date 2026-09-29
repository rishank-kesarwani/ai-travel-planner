export interface CurrencyDefinition {
  code: string;
  symbol: string;
  name: string;
  rateFromUsd: number; // 1 USD = X Currency units
  defaultMinBudget: number;
  defaultMaxBudget: number;
  step: number;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyDefinition> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    rateFromUsd: 83.5,
    defaultMinBudget: 10000,
    defaultMaxBudget: 2000000,
    step: 10000,
  },
  THB: {
    code: 'THB',
    symbol: '฿',
    name: 'Thai Baht',
    rateFromUsd: 36.5,
    defaultMinBudget: 10000,
    defaultMaxBudget: 350000,
    step: 2000,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    rateFromUsd: 1.0,
    defaultMinBudget: 300,
    defaultMaxBudget: 10000,
    step: 100,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    rateFromUsd: 0.92,
    defaultMinBudget: 300,
    defaultMaxBudget: 9000,
    step: 100,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    rateFromUsd: 0.78,
    defaultMinBudget: 250,
    defaultMaxBudget: 8000,
    step: 100,
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    rateFromUsd: 155.0,
    defaultMinBudget: 45000,
    defaultMaxBudget: 1500000,
    step: 10000,
  },
  AED: {
    code: 'AED',
    symbol: 'AED',
    name: 'UAE Dirham',
    rateFromUsd: 3.67,
    defaultMinBudget: 1000,
    defaultMaxBudget: 35000,
    step: 500,
  },
  CAD: {
    code: 'CAD',
    symbol: 'CA$',
    name: 'Canadian Dollar',
    rateFromUsd: 1.36,
    defaultMinBudget: 400,
    defaultMaxBudget: 13000,
    step: 100,
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    rateFromUsd: 1.52,
    defaultMinBudget: 450,
    defaultMaxBudget: 15000,
    step: 100,
  },
  SGD: {
    code: 'SGD',
    symbol: 'S$',
    name: 'Singapore Dollar',
    rateFromUsd: 1.35,
    defaultMinBudget: 400,
    defaultMaxBudget: 13500,
    step: 100,
  },
};

export const DEFAULT_CURRENCY = 'INR';

export function getCurrencyInfo(currencyCode?: string): CurrencyDefinition {
  if (!currencyCode) return SUPPORTED_CURRENCIES[DEFAULT_CURRENCY];
  const upper = currencyCode.toUpperCase().trim();
  return SUPPORTED_CURRENCIES[upper] || SUPPORTED_CURRENCIES[DEFAULT_CURRENCY];
}

export function convertFromUsd(amountInUsd: number, targetCurrency?: string): number {
  const curr = getCurrencyInfo(targetCurrency);
  return Math.round(amountInUsd * curr.rateFromUsd);
}

export function convertToUsd(amountInTargetCurrency: number, sourceCurrency?: string): number {
  const curr = getCurrencyInfo(sourceCurrency);
  return Math.round((amountInTargetCurrency / curr.rateFromUsd) * 100) / 100;
}

export function detectCurrencyFromCountryOrLocation(locOrCountry?: string): string {
  if (!locOrCountry) return DEFAULT_CURRENCY;
  const lower = locOrCountry.toLowerCase().trim();

  // India
  if (
    lower.includes('in') ||
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
    lower.includes('chennai')
  ) {
    return 'INR';
  }

  // Thailand
  if (
    lower.includes('th') ||
    lower.includes('thailand') ||
    lower.includes('phuket') ||
    lower.includes('bangkok') ||
    lower.includes('pattaya') ||
    lower.includes('krabi') ||
    lower.includes('chiang mai') ||
    lower.includes('koh samui')
  ) {
    return 'THB';
  }

  // Japan
  if (
    lower.includes('jp') ||
    lower.includes('japan') ||
    lower.includes('kyoto') ||
    lower.includes('tokyo') ||
    lower.includes('osaka') ||
    lower.includes('hokkaido') ||
    lower.includes('hiroshima')
  ) {
    return 'JPY';
  }

  // UAE
  if (
    lower.includes('ae') ||
    lower.includes('uae') ||
    lower.includes('dubai') ||
    lower.includes('abu dhabi') ||
    lower.includes('sharjah')
  ) {
    return 'AED';
  }

  // UK
  if (
    lower.includes('gb') ||
    lower.includes('uk') ||
    lower.includes('united kingdom') ||
    lower.includes('london') ||
    lower.includes('england') ||
    lower.includes('scotland') ||
    lower.includes('edinburgh')
  ) {
    return 'GBP';
  }

  // Europe (EUR)
  if (
    lower.includes('eu') ||
    lower.includes('italy') ||
    lower.includes('rome') ||
    lower.includes('florence') ||
    lower.includes('venice') ||
    lower.includes('france') ||
    lower.includes('paris') ||
    lower.includes('greece') ||
    lower.includes('santorini') ||
    lower.includes('mykonos') ||
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
    lower.includes('ca') ||
    lower.includes('canada') ||
    lower.includes('banff') ||
    lower.includes('toronto') ||
    lower.includes('vancouver') ||
    lower.includes('montreal')
  ) {
    return 'CAD';
  }

  // Singapore
  if (lower.includes('sg') || lower.includes('singapore')) {
    return 'SGD';
  }

  // Australia
  if (
    lower.includes('au') ||
    lower.includes('australia') ||
    lower.includes('sydney') ||
    lower.includes('melbourne') ||
    lower.includes('brisbane')
  ) {
    return 'AUD';
  }

  // USA
  if (
    lower.includes('us') ||
    lower.includes('usa') ||
    lower.includes('united states') ||
    lower.includes('new york') ||
    lower.includes('california') ||
    lower.includes('san francisco') ||
    lower.includes('los angeles') ||
    lower.includes('hawaii') ||
    lower.includes('miami')
  ) {
    return 'USD';
  }

  return DEFAULT_CURRENCY;
}
