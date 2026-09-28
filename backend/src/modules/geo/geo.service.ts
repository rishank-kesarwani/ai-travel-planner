import { Injectable, Logger } from '@nestjs/common';
import {
  DEFAULT_CURRENCY,
  getCurrencyInfo,
  detectCurrencyFromCountryOrLocation,
  SUPPORTED_CURRENCIES,
  CurrencyDefinition,
} from '../../common/constants/currencies.constant';

export interface GeoDetectionResult {
  countryCode: string;
  countryName: string;
  currency: string;
  currencySymbol: string;
  currencyName: string;
  detectedFrom: 'headers' | 'timezone' | 'location' | 'default';
  supportedCurrencies: Record<string, CurrencyDefinition>;
}

@Injectable()
export class GeoService {
  private readonly logger = new Logger(GeoService.name);

  detectGeo(headers: Record<string, any>, query?: { timezone?: string; destination?: string; country?: string }): GeoDetectionResult {
    // 1. Check explicit headers (Cloudflare, AWS CloudFront, generic proxy headers)
    const headerCountry =
      headers['cf-ipcountry'] ||
      headers['x-country-code'] ||
      headers['x-geo-country'] ||
      headers['cloudfront-viewer-country'];

    if (headerCountry && typeof headerCountry === 'string' && headerCountry !== 'XX') {
      const code = headerCountry.toUpperCase();
      const detectedCurrency = detectCurrencyFromCountryOrLocation(code);
      const currInfo = getCurrencyInfo(detectedCurrency);
      return {
        countryCode: code,
        countryName: this.getCountryName(code),
        currency: currInfo.code,
        currencySymbol: currInfo.symbol,
        currencyName: currInfo.name,
        detectedFrom: 'headers',
        supportedCurrencies: SUPPORTED_CURRENCIES,
      };
    }

    // 2. Check destination query if provided
    if (query?.destination) {
      const detectedCurrency = detectCurrencyFromCountryOrLocation(query.destination);
      const currInfo = getCurrencyInfo(detectedCurrency);
      return {
        countryCode: this.getCountryCodeFromCurrency(detectedCurrency),
        countryName: query.destination,
        currency: currInfo.code,
        currencySymbol: currInfo.symbol,
        currencyName: currInfo.name,
        detectedFrom: 'location',
        supportedCurrencies: SUPPORTED_CURRENCIES,
      };
    }

    // 3. Check timezone query if provided
    if (query?.timezone) {
      const tz = query.timezone.toLowerCase();
      let tzCurrency = DEFAULT_CURRENCY;

      if (tz.includes('calcutta') || tz.includes('kolkata') || tz.includes('india')) {
        tzCurrency = 'INR';
      } else if (tz.includes('bangkok') || tz.includes('thailand')) {
        tzCurrency = 'THB';
      } else if (tz.includes('tokyo') || tz.includes('japan')) {
        tzCurrency = 'JPY';
      } else if (tz.includes('dubai')) {
        tzCurrency = 'AED';
      } else if (tz.includes('london') || tz.includes('europe/london')) {
        tzCurrency = 'GBP';
      } else if (tz.includes('paris') || tz.includes('rome') || tz.includes('berlin') || tz.includes('athens') || tz.includes('madrid')) {
        tzCurrency = 'EUR';
      } else if (tz.includes('toronto') || tz.includes('vancouver') || tz.includes('edmonton')) {
        tzCurrency = 'CAD';
      } else if (tz.includes('sydney') || tz.includes('melbourne') || tz.includes('australia')) {
        tzCurrency = 'AUD';
      } else if (tz.includes('singapore')) {
        tzCurrency = 'SGD';
      } else if (tz.includes('new_york') || tz.includes('los_angeles') || tz.includes('chicago') || tz.includes('america')) {
        tzCurrency = 'USD';
      }

      const currInfo = getCurrencyInfo(tzCurrency);
      return {
        countryCode: this.getCountryCodeFromCurrency(tzCurrency),
        countryName: query.timezone,
        currency: currInfo.code,
        currencySymbol: currInfo.symbol,
        currencyName: currInfo.name,
        detectedFrom: 'timezone',
        supportedCurrencies: SUPPORTED_CURRENCIES,
      };
    }

    // 4. Default fallback (INR)
    const defaultCurrInfo = getCurrencyInfo(DEFAULT_CURRENCY);
    return {
      countryCode: 'IN',
      countryName: 'India',
      currency: defaultCurrInfo.code,
      currencySymbol: defaultCurrInfo.symbol,
      currencyName: defaultCurrInfo.name,
      detectedFrom: 'default',
      supportedCurrencies: SUPPORTED_CURRENCIES,
    };
  }

  private getCountryName(code: string): string {
    const map: Record<string, string> = {
      IN: 'India',
      TH: 'Thailand',
      JP: 'Japan',
      US: 'United States',
      GB: 'United Kingdom',
      AE: 'United Arab Emirates',
      CA: 'Canada',
      AU: 'Australia',
      SG: 'Singapore',
      FR: 'France',
      IT: 'Italy',
      GR: 'Greece',
      DE: 'Germany',
      ES: 'Spain',
    };
    return map[code.toUpperCase()] || code;
  }

  private getCountryCodeFromCurrency(currency: string): string {
    const map: Record<string, string> = {
      INR: 'IN',
      THB: 'TH',
      JPY: 'JP',
      USD: 'US',
      GBP: 'GB',
      AED: 'AE',
      CAD: 'CA',
      AUD: 'AU',
      SGD: 'SG',
      EUR: 'EU',
    };
    return map[currency.toUpperCase()] || 'IN';
  }
}
