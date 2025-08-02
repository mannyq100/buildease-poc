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

// Major global currencies (prioritized in dropdown)
const MAJOR_CURRENCY_CODES = ['USD', 'EUR', 'GBP', 'CAD', 'XOF', 'XAF'];

// Currency name mapping for better labels
const CURRENCY_NAMES: Record<string, string> = {
  'USD': 'US Dollar',
  'EUR': 'Euro',
  'GBP': 'British Pound',
  'CAD': 'Canadian Dollar',
  'XOF': 'West African CFA Franc',
  'XAF': 'Central African CFA Franc',
  'JPY': 'Japanese Yen',
  'CNY': 'Chinese Yuan',
  'AUD': 'Australian Dollar',
  'CHF': 'Swiss Franc',
  'GHS': 'Ghanaian Cedi',
  'NGN': 'Nigerian Naira',
  'ZAR': 'South African Rand',
  'KES': 'Kenyan Shilling',
  'UGX': 'Ugandan Shilling',
  'TZS': 'Tanzanian Shilling',
  'EGP': 'Egyptian Pound',
  'MAD': 'Moroccan Dirham',
  'INR': 'Indian Rupee',
  'BRL': 'Brazilian Real',
  'MXN': 'Mexican Peso',
  'AED': 'UAE Dirham',
  'SAR': 'Saudi Riyal',
  'SGD': 'Singapore Dollar',
  'HKD': 'Hong Kong Dollar',
  'NZD': 'New Zealand Dollar',
  'SEK': 'Swedish Krona',
  'NOK': 'Norwegian Krone',
  'DKK': 'Danish Krone',
  'PLN': 'Polish Zloty',
  'CZK': 'Czech Koruna',
  'HUF': 'Hungarian Forint',
  'RUB': 'Russian Ruble',
  'TRY': 'Turkish Lira',
  'ILS': 'Israeli Shekel',
  'KRW': 'South Korean Won',
  'THB': 'Thai Baht',
  'MYR': 'Malaysian Ringgit',
  'IDR': 'Indonesian Rupiah',
  'PHP': 'Philippine Peso',
  'VND': 'Vietnamese Dong'
};

/**
 * CurrencyService - Centralized currency management
 */
export class CurrencyService {
  private static instance: CurrencyService;
  private currenciesCache: CurrencyOption[] | null = null;

  private constructor() {}

  static getInstance(): CurrencyService {
    if (!CurrencyService.instance) {
      CurrencyService.instance = new CurrencyService();
    }
    return CurrencyService.instance;
  }

  /**
   * Get all available currencies from country-state-city library
   */
  getAllCurrencies(): CurrencyOption[] {
    if (this.currenciesCache) {
      return this.currenciesCache;
    }

    try {
      const countries = Country.getAllCountries();
      const currencyMap = new Map<string, CurrencyOption>();
      
      // Extract unique currencies from all countries
      countries.forEach(country => {
        if (country.currency && country.currency.trim()) {
          const currencyCode = country.currency.trim();
          const currencyName = CURRENCY_NAMES[currencyCode] || currencyCode;
          const isMajor = MAJOR_CURRENCY_CODES.includes(currencyCode);
          
          if (!currencyMap.has(currencyCode)) {
            currencyMap.set(currencyCode, {
              value: currencyCode,
              label: `${currencyCode} - ${currencyName}`,
              isMajor
            });
          }
        }
      });
      
      // Convert map to array and sort
      const currencies = Array.from(currencyMap.values()).sort((a, b) => {
        // Major currencies first, then alphabetical
        if (a.isMajor && !b.isMajor) return -1;
        if (!a.isMajor && b.isMajor) return 1;
        return a.label.localeCompare(b.label);
      });

      this.currenciesCache = currencies;
      return currencies;
    } catch (error) {
      console.error('Error generating currencies from country-state-city:', error);
      // Fallback to major currencies if there's an error
      return MAJOR_CURRENCY_CODES.map(code => ({
        value: code,
        label: `${code} - ${CURRENCY_NAMES[code] || code}`,
        isMajor: true
      }));
    }
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
    const currencies = this.getAllCurrencies();
    const currency = currencies.find(c => c.value === currencyCode);
    
    if (!currency) {
      return null;
    }

    return {
      code: currencyCode,
      name: CURRENCY_NAMES[currencyCode] || currencyCode,
      symbol: this.getCurrencySymbol(currencyCode),
      isMajor: currency.isMajor
    };
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
  getBudgetGuidance(currencyCode: string): string {
    switch(currencyCode) {
      case 'USD':
        return 'Construction costs typically range from $150-500 per square meter depending on location, quality, and complexity.';
      case 'EUR':
        return 'Construction costs typically range from €120-450 per square meter depending on location, quality, and complexity.';
      case 'GBP':
        return 'Construction costs typically range from £100-400 per square meter depending on location, quality, and complexity.';
      case 'GHS':
        return 'Construction costs typically range from GHS 2,500-5,000 per square meter depending on location and quality.';
      case 'NGN':
        return 'Construction costs typically range from ₦50,000-150,000 per square meter depending on location and quality.';
      case 'ZAR':
        return 'Construction costs typically range from R2,000-6,000 per square meter depending on location and quality.';
      case 'KES':
        return 'Construction costs typically range from KSh 15,000-45,000 per square meter depending on location and quality.';
      default:
        return 'Construction costs vary significantly by location, quality, and local labor rates. Consider getting quotes from local contractors.';
    }
  }

  /**
   * Clear cache (useful for testing or memory management)
   */
  clearCache(): void {
    this.currenciesCache = null;
  }
}

// Export singleton instance
export const currencyService = CurrencyService.getInstance();