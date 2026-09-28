'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  CurrencyInfo,
  DEFAULT_CURRENCY,
  SUPPORTED_CURRENCIES,
  getCurrency,
  detectCurrencyFromBrowserTimezone,
  formatPrice as formatPriceUtil,
  convertBetweenCurrencies,
} from './currencies';
import { useAuth } from './auth-context';
import { api } from './api';

interface CurrencyContextType {
  currency: string;
  currencyInfo: CurrencyInfo;
  setCurrency: (code: string, syncWithProfile?: boolean) => void;
  formatPrice: (amount: number, overrideCode?: string) => string;
  convertPrice: (amount: number, fromCode: string) => number;
  detectedCountry: string | null;
  isLoading: boolean;
  supportedCurrencies: Record<string, CurrencyInfo>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { user, updatePreferences } = useAuth();
  const [currency, setCurrencyState] = useState<string>(DEFAULT_CURRENCY);
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize and detect geo on mount
  useEffect(() => {
    const initCurrency = async () => {
      // 1. Check user profile preference if logged in
      if (user?.preferences?.preferredCurrency) {
        setCurrencyState(user.preferences.preferredCurrency);
        localStorage.setItem('preferredCurrency', user.preferences.preferredCurrency);
        setIsLoading(false);
        return;
      }

      // 2. Check localStorage
      const cached = localStorage.getItem('preferredCurrency');
      if (cached && SUPPORTED_CURRENCIES[cached]) {
        setCurrencyState(cached);
        setIsLoading(false);
        return;
      }

      // 3. Detect via Edge Backend / Browser Timezone
      try {
        const clientTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
        const geoRes: any = await api.get(`/api/v1/geo/detect?timezone=${encodeURIComponent(clientTz)}`);
        if (geoRes && geoRes.currency && SUPPORTED_CURRENCIES[geoRes.currency]) {
          setCurrencyState(geoRes.currency);
          setDetectedCountry(geoRes.countryName || geoRes.countryCode);
          localStorage.setItem('preferredCurrency', geoRes.currency);
        } else {
          // Fallback to client timezone
          const tzCurrency = detectCurrencyFromBrowserTimezone();
          setCurrencyState(tzCurrency);
          localStorage.setItem('preferredCurrency', tzCurrency);
        }
      } catch (err) {
        // Fallback to client timezone or INR
        const tzCurrency = detectCurrencyFromBrowserTimezone();
        setCurrencyState(tzCurrency);
        localStorage.setItem('preferredCurrency', tzCurrency);
      } finally {
        setIsLoading(false);
      }
    };

    initCurrency();
  }, [user?.preferences?.preferredCurrency]);

  // Sync preference with user profile upon login if user doesn't have one set yet
  useEffect(() => {
    if (user && !user.preferences?.preferredCurrency && currency) {
      updatePreferences({ preferredCurrency: currency }).catch(() => {});
    }
  }, [user, currency, updatePreferences]);

  const setCurrency = (code: string, syncWithProfile = true) => {
    const valid = getCurrency(code);
    setCurrencyState(valid.code);
    localStorage.setItem('preferredCurrency', valid.code);

    if (syncWithProfile && user) {
      updatePreferences({ preferredCurrency: valid.code }).catch(() => {});
    }
  };

  const formatPrice = (amount: number, overrideCode?: string) => {
    return formatPriceUtil(amount, overrideCode || currency);
  };

  const convertPrice = (amount: number, fromCode: string) => {
    return convertBetweenCurrencies(amount, fromCode, currency);
  };

  const currencyInfo = getCurrency(currency);

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        currencyInfo,
        setCurrency,
        formatPrice,
        convertPrice,
        detectedCountry,
        isLoading,
        supportedCurrencies: SUPPORTED_CURRENCIES,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
