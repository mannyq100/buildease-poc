/**
 * Currency Service
 * Centralized service for handling currency data, formatting, and recommendations
 * Follows BuildEase standards: clean, maintainable, performant
 */

import { Country } from 'country-state-city';

// Currency option interface
export interface CurrencyOption {
  value: string;
  label: string;
  isMajor: boolean;
  isRecommended?: boolean;
  disabled?: boolean;
}

// Currency details interface
export interface CurrencyDetails {
  code: string;
  name: string;
  symbol: string;
  isMajor: boolean;
}

// Exchange rate response (lightweight)
export interface ExchangeRateInfo {
  from: string;
  to: string;
  rate: number;
  timestamp: string;
  source: 'currencylayer' | 'exchangerate.host' | 'fallback';
}

// Major global currencies (prioritized in dropdown)
const MAJOR_CURRENCY_CODES = ['USD', 'EUR', 'GBP', 'CAD', 'XOF', 'XAF'];

/**
 * CurrencyService - Centralized currency management
 */
export class CurrencyService {
  private static instance: CurrencyService;
  private currenciesCache: CurrencyOption[] | null = null;
  private exchangeCache: Map<string, ExchangeRateInfo> = new Map();
  // Optional cache for display name labels
  private displayNameCache: Map<string, string> = new Map();

  private constructor() {}

  static getInstance(): CurrencyService {
    if (!CurrencyService.instance) {
      CurrencyService.instance = new CurrencyService();
    }
    return CurrencyService.instance;
  }
  
  /**
   * Get currency label using Intl.DisplayNames.
   * Example: "USD - US Dollar"
   */
  private getCurrencyLabel(code: string): string {
    if (!code) return '';
    const cached = this.displayNameCache.get(code);
    if (cached) return `${code} - ${cached}`;
    
    try {
      const displayNames = new Intl.DisplayNames(['en'], { type: 'currency' });
      const name = displayNames.of(code) || code;
      this.displayNameCache.set(code, name);
      return `${code} - ${name}`;
    } catch {
      // Fallback to code only
      this.displayNameCache.set(code, code);
      return code;
    }
  }

  /**
   * Simple smart currency options mirroring BuildingBudgetForm behavior:
   * - If a country's currency is available, put it first and mark as recommended
   * - Then list all other currencies alphabetically by label
   * This avoids major-currency grouping and separators for a flatter list.
   */
  getSmartCurrencyOptionsSimple(countryName?: string): CurrencyOption[] {
    // Build a unique set of all currency codes seen in countries
    const prioritized: CurrencyOption[] = [];
    let suggested: string | null = null;

    if (countryName) {
      try {
        const countries = Country.getAllCountries();
        const country = countries.find(c => c.name === countryName);
        if (country?.currency) suggested = country.currency.trim();
      } catch (error) {
        console.error('Error getting country currency:', error);
      }
    }

    // Get all currency codes from countries
    const allCodes = this.getAllCurrencyCodes();
    const allOptions: CurrencyOption[] = allCodes.map((code: string) => ({
      value: code,
      label: this.getCurrencyLabel(code),
      isMajor: MAJOR_CURRENCY_CODES.includes(code)
    }));

    // 1) Suggested currency first
    if (suggested) {
      const option = allOptions.find(o => o.value === suggested);
      if (option) {
        prioritized.push({ ...option, isRecommended: true });
      } else {
        // In rare case code missing from allOptions, synthesize
        prioritized.push({
          value: suggested,
          label: this.getCurrencyLabel(suggested),
          isMajor: MAJOR_CURRENCY_CODES.includes(suggested),
          isRecommended: true
        });
      }
    }

    // 2) Other currencies (excluding suggested), sorted alphabetically by label
    const others = allOptions
      .filter(o => o.value !== suggested)
      .sort((a, b) => a.label.localeCompare(b.label));
    prioritized.push(...others);

    return prioritized;
  }
  

  /**
   * Get all unique currency codes from countries
   */
  private getAllCurrencyCodes(): string[] {
    try {
      const countries = Country.getAllCountries();
      const currencySet = new Set<string>();
      
      countries.forEach(country => {
        if (country.currency?.trim()) {
          currencySet.add(country.currency.trim());
        }
      });
      
      return Array.from(currencySet).sort();
    } catch (error) {
      console.error('Error getting currencies from country-state-city:', error);
      return MAJOR_CURRENCY_CODES;
    }
  }

  /**
   * Get all available currencies as options
   */
  getAllCurrencies(): CurrencyOption[] {
    if (this.currenciesCache) {
      return this.currenciesCache;
    }

    const codes = this.getAllCurrencyCodes();
    const currencies = codes.map(code => ({
      value: code,
      label: this.getCurrencyLabel(code),
      isMajor: MAJOR_CURRENCY_CODES.includes(code)
    })).sort((a, b) => {
      // Major currencies first, then alphabetical
      if (a.isMajor && !b.isMajor) return -1;
      if (!a.isMajor && b.isMajor) return 1;
      return a.label.localeCompare(b.label);
    });

    this.currenciesCache = currencies;
    return currencies;
  }

  /**
   * Get smart currency options prioritized by country
   */
  getSmartCurrencyOptions(countryName?: string): CurrencyOption[] {
    const allCurrencies = this.getAllCurrencies();
    const prioritizedCurrencies: CurrencyOption[] = [];
    
    // Get country's currency if country is provided
    let suggestedCurrency: string | null = null;
    if (countryName) {
      try {
        const countries = Country.getAllCountries();
        const countryData = countries.find(c => c.name === countryName);
        if (countryData?.currency) {
          suggestedCurrency = countryData.currency;
        }
      } catch (error) {
        console.error('Error getting country currency:', error);
      }
    }
    
    // Get major currencies
    const majorCurrencies = allCurrencies.filter(c => c.isMajor);
    
    // 1. Add country's currency first if it exists and isn't already a major currency
    if (suggestedCurrency && !MAJOR_CURRENCY_CODES.includes(suggestedCurrency)) {
      const countryCurrencyOption = allCurrencies.find(c => c.value === suggestedCurrency);
      if (countryCurrencyOption) {
        prioritizedCurrencies.push({
          ...countryCurrencyOption,
          label: countryCurrencyOption.label,
          isRecommended: true
        });
      }
    }
    
    // 2. Add major currencies, highlighting the suggested one
    prioritizedCurrencies.push(...majorCurrencies.map(c => ({
      ...c,
      isRecommended: c.value === suggestedCurrency,
      label: c.label
    })));
    
    // 3. Add separator if we have other currencies to show
    const otherCurrencies = allCurrencies
      .filter(c => !c.isMajor && c.value !== suggestedCurrency)
      .sort((a, b) => a.label.localeCompare(b.label));
    
    if (otherCurrencies.length > 0) {
      prioritizedCurrencies.push({ 
        value: 'separator', 
        label: '──── Other Currencies ────', 
        disabled: true, 
        isMajor: false 
      });
      
      // 4. Add other currencies (sorted alphabetically)
      prioritizedCurrencies.push(...otherCurrencies);
    }
    
    return prioritizedCurrencies;
  }

  /**
   * Format currency value for display
   */
  formatCurrency(value: string, currencyCode: string, locale: string = 'en-US'): string {
    if (!value) return '';
    
    const numericValue = parseFloat(value.replace(/,/g, ''));
    if (isNaN(numericValue)) return value;
    
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
        maximumFractionDigits: 0
      }).format(numericValue);
    } catch (error) {
      console.error('Error formatting currency:', error);
      return `${currencyCode} ${numericValue.toLocaleString()}`;
    }
  }

  /**
   * Get currency details by code
   */
  getCurrencyDetails(currencyCode: string): CurrencyDetails | null {
    try {
      const displayNames = new Intl.DisplayNames(['en'], { type: 'currency' });
      const name = displayNames.of(currencyCode) || currencyCode;
      
      return {
        code: currencyCode,
        name,
        symbol: this.getCurrencySymbol(currencyCode),
        isMajor: MAJOR_CURRENCY_CODES.includes(currencyCode)
      };
    } catch {
      return {
        code: currencyCode,
        name: currencyCode,
        symbol: currencyCode,
        isMajor: MAJOR_CURRENCY_CODES.includes(currencyCode)
      };
    }
  }

  /**
   * Get currency symbol for a currency code
   */
  getCurrencySymbol(currencyCode: string): string {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).formatToParts(0).find(part => part.type === 'currency')?.value || currencyCode;
    } catch {
      return currencyCode;
    }
  }

  /**
   * Get budget guidance for a currency
   */
  getBudgetGuidance(_currencyCode: string): string {
    return 'Construction costs vary significantly by location, quality, and local labor rates. Consider getting quotes from local contractors for accurate estimates.';
  }

  /**
   * Clear cache (useful for testing or memory management)
   */
  clearCache(): void {
    this.currenciesCache = null;
    this.exchangeCache.clear();
  }

  /**
   * Fetch exchange rate between two currencies using CurrencyLayer API
   * Includes simple in-memory caching for the session.
   */
  async getExchangeRate(from: string, to: string): Promise<ExchangeRateInfo | null> {
    if (!from || !to || from === to) {
      return {
        from,
        to,
        rate: 1,
        timestamp: new Date().toISOString(),
        source: 'fallback'
      };
    }

    const key = `${from}-${to}`;
    const cached = this.exchangeCache.get(key);
    if (cached) return cached;

    try {
      // Get API key from environment variables
      const apiKey = import.meta.env.VITE_CURRENCY_LAYER_API_KEY;
      if (!apiKey) {
        throw new Error('Currency API key not configured');
      }

      // Build CurrencyLayer API URL
      const url = `http://apilayer.net/api/live?access_key=${apiKey}&currencies=${encodeURIComponent(to)}&source=${encodeURIComponent(from)}&format=1`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const json = await res.json();
      
      // Check if API request was successful
      if (!json.success) {
        throw new Error(`API Error: ${json.error?.info || 'Unknown error'}`);
      }

      // Extract rate from quotes object (format: "FROMUSD": rate)
      const quoteKey = `${from}${to}`;
      const rate = json.quotes?.[quoteKey];
      
      if (typeof rate !== 'number') {
        throw new Error('Rate not found in response');
      }

      const info: ExchangeRateInfo = {
        from,
        to,
        rate,
        timestamp: json.timestamp ? new Date(json.timestamp * 1000).toISOString() : new Date().toISOString(),
        source: 'currencylayer'
      };
      
      this.exchangeCache.set(key, info);
      return info;
    } catch (e) {
      console.warn('Exchange rate fetch failed, using fallback 1:1', e);
      const info: ExchangeRateInfo = {
        from,
        to,
        rate: 1,
        timestamp: new Date().toISOString(),
        source: 'fallback'
      };
      this.exchangeCache.set(key, info);
      return info;
    }
  }
}

// Export singleton instance
export const currencyService = CurrencyService.getInstance();