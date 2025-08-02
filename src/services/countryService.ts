/**
 * Country Service
 * Centralized service for handling country, region, and currency data
 * Follows BuildEase standards: clean, maintainable, performant
 */

import { Country, State } from 'country-state-city';

// Types for country and state data
export interface CountryOption {
  value: string;
  label: string;
  isoCode: string;
  currency?: string;
}

export interface StateOption {
  value: string;
  label: string;
  isoCode: string;
  countryCode: string;
}

export interface CountryDetails {
  name: string;
  isoCode: string;
  currency?: string;
  phonecode?: string;
  flag?: string;
}

/**
 * CountryService - Centralized country and region management
 */
export class CountryService {
  private static instance: CountryService;
  private countriesCache: CountryOption[] | null = null;
  private statesCache: Map<string, StateOption[]> = new Map();

  private constructor() {}

  static getInstance(): CountryService {
    if (!CountryService.instance) {
      CountryService.instance = new CountryService();
    }
    return CountryService.instance;
  }

  /**
   * Get all countries sorted alphabetically
   */
  async getAllCountries(): Promise<CountryOption[]> {
    if (this.countriesCache) {
      return this.countriesCache;
    }

    try {
      const allCountries = Country.getAllCountries();
      const countryOptions: CountryOption[] = allCountries.map(country => ({
        value: country.name,
        label: country.name,
        isoCode: country.isoCode,
        currency: country.currency
      }));

      // Sort countries alphabetically
      countryOptions.sort((a, b) => a.label.localeCompare(b.label));
      
      this.countriesCache = countryOptions;
      return countryOptions;
    } catch (error) {
      console.error('Error loading countries:', error);
      return [];
    }
  }

  /**
   * Get states/regions for a specific country
   */
  async getStatesForCountry(countryName: string): Promise<StateOption[]> {
    // Check cache first
    if (this.statesCache.has(countryName)) {
      return this.statesCache.get(countryName)!;
    }

    try {
      const countries = await this.getAllCountries();
      const country = countries.find(c => c.value === countryName);
      
      if (!country?.isoCode) {
        return [];
      }

      const countryStates = State.getStatesOfCountry(country.isoCode);
      const stateOptions: StateOption[] = countryStates.map(state => ({
        value: state.name,
        label: state.name,
        isoCode: state.isoCode,
        countryCode: state.countryCode
      }));

      // Sort states alphabetically
      stateOptions.sort((a, b) => a.label.localeCompare(b.label));
      
      // Cache the result
      this.statesCache.set(countryName, stateOptions);
      return stateOptions;
    } catch (error) {
      console.error('Error loading states:', error);
      return [];
    }
  }

  /**
   * Get country details by name
   */
  async getCountryDetails(countryName: string): Promise<CountryDetails | null> {
    try {
      const countries = await this.getAllCountries();
      const country = countries.find(c => c.value === countryName);
      
      if (!country) {
        return null;
      }

      const countryData = Country.getCountryByCode(country.isoCode);
      if (!countryData) {
        return null;
      }

      return {
        name: countryData.name,
        isoCode: countryData.isoCode,
        currency: countryData.currency,
        phonecode: countryData.phonecode,
        flag: countryData.flag
      };
    } catch (error) {
      console.error('Error getting country details:', error);
      return null;
    }
  }

  /**
   * Get suggested country from browser locale
   */
  getSuggestedCountryFromLocale(): string {
    try {
      const locale = navigator.language || 'en-US';
      const countryCode = locale.split('-')[1];
      
      const countryMap: Record<string, string> = {
        'US': 'United States',
        'GB': 'United Kingdom', 
        'CA': 'Canada',
        'AU': 'Australia',
        'GH': 'Ghana',
        'NG': 'Nigeria',
        'KE': 'Kenya',
        'ZA': 'South Africa',
        'IN': 'India',
        'DE': 'Germany',
        'FR': 'France',
        'IT': 'Italy',
        'ES': 'Spain',
        'BR': 'Brazil',
        'MX': 'Mexico',
        'JP': 'Japan',
        'CN': 'China',
        'RU': 'Russia'
      };
      
      return countryMap[countryCode] || '';
    } catch {
      return '';
    }
  }

  /**
   * Get currency for a specific country
   */
  async getCurrencyForCountry(countryName: string): Promise<string | null> {
    try {
      const countryDetails = await this.getCountryDetails(countryName);
      return countryDetails?.currency || null;
    } catch (error) {
      console.error('Error getting currency for country:', error);
      return null;
    }
  }

  /**
   * Clear cache (useful for testing or memory management)
   */
  clearCache(): void {
    this.countriesCache = null;
    this.statesCache.clear();
  }
}

// Export singleton instance
export const countryService = CountryService.getInstance();