/**
 * Smart Currency Selection Hook
 * Automatically selects currency based on country while allowing user override
 * Follows BuildEase standards: user control with intelligent assistance
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  getCurrencyFromCountry, 
  suggestCurrency, 
  SupportedCurrency,
  DEFAULT_CURRENCY,
  isSupportedCurrency
} from '@/utils/core/currencyUtils';

interface UseSmartCurrencyOptions {
  country?: string;
  projectType?: string;
  initialCurrency?: string;
  onCurrencyChange?: (currency: SupportedCurrency, isAutoSelected: boolean) => void;
}

interface SmartCurrencyState {
  currency: SupportedCurrency;
  isAutoSelected: boolean;
  hasUserOverride: boolean;
  suggestion: {
    currency: SupportedCurrency;
    reason: string;
  } | null;
}

export function useSmartCurrency(options: UseSmartCurrencyOptions = {}) {
  const { 
    country, 
    projectType, 
    initialCurrency, 
    onCurrencyChange 
  } = options;

  // Initialize state
  const [state, setState] = useState<SmartCurrencyState>(() => {
    const initialValidCurrency = initialCurrency && isSupportedCurrency(initialCurrency) 
      ? initialCurrency 
      : DEFAULT_CURRENCY;

    return {
      currency: initialValidCurrency,
      isAutoSelected: !initialCurrency,
      hasUserOverride: !!initialCurrency,
      suggestion: null
    };
  });

  // Generate smart suggestion
  const generateSuggestion = useCallback((currentCountry?: string, currentProjectType?: string) => {
    if (!currentCountry) return null;

    const suggestedCurrency = suggestCurrency({
      country: currentCountry,
      projectType: currentProjectType
    });

    // Don't suggest if it's the same as current
    if (suggestedCurrency === state.currency) return null;

    // Generate reason for suggestion
    let reason = '';
    if (suggestedCurrency === getCurrencyFromCountry(currentCountry)) {
      reason = `${currentCountry}'s local currency`;
    } else if (suggestedCurrency === 'USD' && currentProjectType === 'commercial') {
      reason = 'Common for commercial projects';
    } else {
      reason = 'Based on your selections';
    }

    return {
      currency: suggestedCurrency,
      reason
    };
  }, [state.currency]);

  // Auto-select currency when country changes (if user hasn't overridden)
  useEffect(() => {
    if (!country || state.hasUserOverride) return;

    const newCurrency = getCurrencyFromCountry(country);
    if (newCurrency !== state.currency) {
      setState(prev => ({
        ...prev,
        currency: newCurrency,
        isAutoSelected: true,
        suggestion: null
      }));

      onCurrencyChange?.(newCurrency, true);
    }
  }, [country, state.hasUserOverride, state.currency, onCurrencyChange]);

  // Generate suggestions when context changes
  useEffect(() => {
    const suggestion = generateSuggestion(country, projectType);
    setState(prev => ({ ...prev, suggestion }));
  }, [country, projectType, generateSuggestion]);

  // Manual currency selection (user override)
  const setCurrency = useCallback((newCurrency: SupportedCurrency) => {
    setState(prev => ({
      ...prev,
      currency: newCurrency,
      isAutoSelected: false,
      hasUserOverride: true,
      suggestion: null
    }));

    onCurrencyChange?.(newCurrency, false);
  }, [onCurrencyChange]);

  // Accept suggestion
  const acceptSuggestion = useCallback(() => {
    if (!state.suggestion) return;

    const { currency: suggestedCurrency } = state.suggestion;
    setState(prev => ({
      ...prev,
      currency: suggestedCurrency,
      isAutoSelected: true,
      hasUserOverride: false,
      suggestion: null
    }));

    onCurrencyChange?.(suggestedCurrency, true);
  }, [state.suggestion, onCurrencyChange]);

  // Dismiss suggestion
  const dismissSuggestion = useCallback(() => {
    setState(prev => ({
      ...prev,
      suggestion: null,
      hasUserOverride: true
    }));
  }, []);

  // Reset to auto-selection (useful when user wants to go back to smart defaults)
  const resetToAuto = useCallback(() => {
    const autoCurrency = country ? getCurrencyFromCountry(country) : DEFAULT_CURRENCY;
    
    setState(prev => ({
      ...prev,
      currency: autoCurrency,
      isAutoSelected: true,
      hasUserOverride: false,
      suggestion: null
    }));

    onCurrencyChange?.(autoCurrency, true);
  }, [country, onCurrencyChange]);

  return {
    // Current state
    currency: state.currency,
    isAutoSelected: state.isAutoSelected,
    hasUserOverride: state.hasUserOverride,
    suggestion: state.suggestion,
    
    // Actions
    setCurrency,
    acceptSuggestion,
    dismissSuggestion,
    resetToAuto,
    
    // Utilities
    hasSuggestion: !!state.suggestion
  };
}

// Convenience hook for simple currency selection without suggestions
export function useSimpleCurrencySelection(country?: string, initialCurrency?: string) {
  const { currency, setCurrency, isAutoSelected } = useSmartCurrency({
    country,
    initialCurrency
  });

  return {
    currency,
    setCurrency,
    isAutoSelected
  };
}