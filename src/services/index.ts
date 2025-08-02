/**
 * Services Index
 * Centralized exports for all BuildEase services
 */

// Country and Currency Services
export { countryService, CountryService } from './countryService';
export { currencyService, CurrencyService } from './currencyService';
export type { CountryOption, StateOption, CountryDetails } from './countryService';
export type { CurrencyOption, CurrencyDetails } from './currencyService';

// Existing services (re-export for convenience)
export { default as projectService } from './projectService';
export { default as projectCreationService } from './projectCreationService';
export { default as documentService } from './documentService';
export { default as notificationService } from './notificationService';