/**
 * Currency Utilities
 * Smart currency selection based on country using country-state-city library
 * Follows BuildEase standards: clean, focused, under 400 lines
 */

import { Country } from 'country-state-city';

// Popular currencies with their symbols and names for display
export const CURRENCY_DETAILS = {
  // Major Global Currencies
  'USD': { symbol: '$', name: 'US Dollar', region: 'Americas' },
  'EUR': { symbol: '€', name: 'Euro', region: 'Europe' },
  'GBP': { symbol: '£', name: 'British Pound', region: 'Europe' },
  'JPY': { symbol: '¥', name: 'Japanese Yen', region: 'Asia' },
  
  // African Currencies (BuildEase focus)
  'GHS': { symbol: '₵', name: 'Ghanaian Cedi', region: 'Africa' },
  'NGN': { symbol: '₦', name: 'Nigerian Naira', region: 'Africa' },
  'KES': { symbol: 'KSh', name: 'Kenyan Shilling', region: 'Africa' },
  'ZAR': { symbol: 'R', name: 'South African Rand', region: 'Africa' },
  'EGP': { symbol: '£', name: 'Egyptian Pound', region: 'Africa' },
  'MAD': { symbol: 'DH', name: 'Moroccan Dirham', region: 'Africa' },
  'TZS': { symbol: 'TSh', name: 'Tanzanian Shilling', region: 'Africa' },
  'UGX': { symbol: 'USh', name: 'Ugandan Shilling', region: 'Africa' },
  'XOF': { symbol: 'CFA', name: 'West African CFA Franc', region: 'Africa' },
  'XAF': { symbol: 'FCFA', name: 'Central African CFA Franc', region: 'Africa' },
  
  // Other Common Currencies
  'CAD': { symbol: 'C$', name: 'Canadian Dollar', region: 'Americas' },
  'AUD': { symbol: 'A$', name: 'Australian Dollar', region: 'Oceania' },
  'INR': { symbol: '₹', name: 'Indian Rupee', region: 'Asia' },
  'CNY': { symbol: '¥', name: 'Chinese Yuan', region: 'Asia' },
  'BRL': { symbol: 'R$', name: 'Brazilian Real', region: 'Americas' },
  'MXN': { symbol: '$', name: 'Mexican Peso', region: 'Americas' },
  'CHF': { symbol: 'Fr', name: 'Swiss Franc', region: 'Europe' },
  'SGD': { symbol: 'S$', name: 'Singapore Dollar', region: 'Asia' },
  'AED': { symbol: 'د.إ', name: 'UAE Dirham', region: 'Middle East' },
  'SAR': { symbol: '﷼', name: 'Saudi Riyal', region: 'Middle East' }
} as const;

export type SupportedCurrency = keyof typeof CURRENCY_DETAILS;

// No default currency - should be determined by user's country selection
export const DEFAULT_CURRENCY: SupportedCurrency | null = null;

// Major currencies for construction projects (alphabetically ordered)
export const CONSTRUCTION_FRIENDLY_CURRENCIES: SupportedCurrency[] = [
  'USD', 'EUR', 'GBP', 'AED', 'AUD', 'CAD', 'CHF', 'GHS', 'INR', 'KES', 'NGN', 'ZAR'
];

/**
 * Get currency code for a country using country-state-city library
 */
export function getCurrencyFromCountry(countryName: string): SupportedCurrency {
  try {
    // Get all countries from the library
    const countries = Country.getAllCountries();
    
    // Find country by name (case-insensitive)
    const country = countries.find(c => 
      c.name.toLowerCase() === countryName.toLowerCase() ||
      c.isoCode.toLowerCase() === countryName.toLowerCase()
    );
    
    if (country?.currency) {
      const currency = country.currency as SupportedCurrency;
      
      // Return currency if we support it, otherwise return default
      return CURRENCY_DETAILS[currency] ? currency : DEFAULT_CURRENCY;
    }
    
    // Fallback to default currency
    return DEFAULT_CURRENCY;
    
  } catch (error) {
    // Handle any errors gracefully
    console.warn('Error getting currency from country:', error);
    return DEFAULT_CURRENCY;
  }
}

/**
 * Get currency details including symbol and name
 */
export function getCurrencyDetails(currency: SupportedCurrency) {
  return CURRENCY_DETAILS[currency] || CURRENCY_DETAILS[DEFAULT_CURRENCY];
}

/**
 * Format currency amount with proper symbol and locale
 */
export function formatCurrency(
  amount: number, 
  currency: SupportedCurrency, 
  locale: string = 'en-US'
): string {
  try {
    // Use Intl.NumberFormat for proper formatting
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    
    return formatter.format(amount);
  } catch (_error) {
    // Fallback formatting if Intl fails
    const details = getCurrencyDetails(currency);
    return `${details.symbol}${amount.toLocaleString()}`;
  }
}

/**
 * Get all supported currencies grouped by region
 */
export function getCurrenciesByRegion() {
  const grouped: Record<string, Array<{ currency: SupportedCurrency; details: typeof CURRENCY_DETAILS[SupportedCurrency] }>> = {};
  
  Object.entries(CURRENCY_DETAILS).forEach(([currency, details]) => {
    const region = details.region;
    if (!grouped[region]) {
      grouped[region] = [];
    }
    grouped[region].push({ 
      currency: currency as SupportedCurrency, 
      details 
    });
  });
  
  return grouped;
}

/**
 * Get construction-friendly currencies (prioritized for BuildEase users)
 */
export function getConstructionCurrencies() {
  return CONSTRUCTION_FRIENDLY_CURRENCIES.map(currency => ({
    currency,
    details: getCurrencyDetails(currency)
  }));
}

/**
 * Validate if a currency is supported
 */
export function isSupportedCurrency(currency: string): currency is SupportedCurrency {
  return currency in CURRENCY_DETAILS;
}

/**
 * Get all countries with their currency information
 * Useful for building country-currency dropdowns
 */
export function getCountriesWithCurrency() {
  try {
    const countries = Country.getAllCountries();
    
    return countries
      .map(country => ({
        name: country.name,
        isoCode: country.isoCode,
        currency: country.currency as SupportedCurrency,
        currencyDetails: CURRENCY_DETAILS[country.currency as SupportedCurrency],
        flag: country.flag
      }))
      .filter(country => country.currencyDetails) // Only include supported currencies
      .sort((a, b) => a.name.localeCompare(b.name));
      
  } catch (error) {
    console.warn('Error getting countries with currency:', error);
    return [];
  }
}

/**
 * Smart currency suggestion based on user context
 */
export function suggestCurrency(context: {
  country?: string;
  userPreference?: string;
  projectType?: string;
}): SupportedCurrency {
  const { country, userPreference, projectType } = context;
  
  // 1. User has explicitly set a preference
  if (userPreference && isSupportedCurrency(userPreference)) {
    return userPreference;
  }
  
  // 2. Get currency from selected country
  if (country) {
    const countryCurrency = getCurrencyFromCountry(country);
    if (countryCurrency !== DEFAULT_CURRENCY) {
      return countryCurrency;
    }
  }
  
  // 3. For international projects, suggest USD
  if (projectType === 'commercial' || projectType === 'industrial') {
    return 'USD';
  }
  
  // 4. Fallback to BuildEase default
  return DEFAULT_CURRENCY;
}

/**
 * Get currency exchange rate context (placeholder for future enhancement)
 */
export function getCurrencyExchangeContext(
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency = 'USD'
) {
  // TODO: Integrate with exchange rate API for live rates
  // For now, return placeholder structure
  return {
    from: fromCurrency,
    to: toCurrency,
    rate: null, // Will be populated with live data
    lastUpdated: null,
    source: 'Future Enhancement'
  };
}