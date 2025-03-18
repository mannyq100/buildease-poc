/**
 * Chart utilities and constants for data visualization components
 */

import { ReactNode } from 'react'

// Enhanced color palette for consistent visualization
export const CHART_COLORS = {
  primary: ['#1E40AF', '#3B82F6', '#93C5FD', '#DBEAFE'], // Blues
  success: ['#047857', '#10B981', '#6EE7B7', '#D1FAE5'], // Greens
  warning: ['#B45309', '#F59E0B', '#FCD34D', '#FEF3C7'], // Ambers
  accent: ['#6D28D9', '#8B5CF6', '#C4B5FD', '#EDE9FE'], // Purples
  danger: ['#DC2626', '#EF4444', '#FCA5A5', '#FEE2E2'], // Reds
  neutral: ['#374151', '#6B7280', '#D1D5DB', '#F3F4F6'], // Grays
}

// Flat color array for compatibility with existing code
export const CHART_COLOR_ARRAY = [
  ...CHART_COLORS.primary,
  ...CHART_COLORS.success,
  ...CHART_COLORS.warning,
  ...CHART_COLORS.accent,
  ...CHART_COLORS.danger,
  ...CHART_COLORS.neutral,
]

// Chart theme configurations for light and dark mode
export const CHART_THEME = {
  light: {
    backgroundColor: 'white',
    textColor: '#374151',
    gridColor: '#E5E7EB',
    tooltipBg: 'white',
    tooltipBorder: '#E5E7EB',
    tooltipText: '#1F2937',
  },
  dark: {
    backgroundColor: '#1F2937',
    textColor: '#E5E7EB',
    gridColor: '#374151',
    tooltipBg: '#1F2937',
    tooltipBorder: '#374151',
    tooltipText: '#F9FAFB',
  }
}

// Chart type definitions
export type ChartType = 'bar' | 'line' | 'pie' | 'area'
export type ColorScheme = 'primary' | 'success' | 'warning' | 'accent' | 'danger' | 'neutral'

// Utility to get chart colors based on scheme
export function getChartColors(scheme: ColorScheme = 'primary'): string[] {
  return CHART_COLORS[scheme] || CHART_COLORS.primary
}

// Utility to determine if dark mode is active
export function isDarkMode(): boolean {
  if (typeof document !== 'undefined') {
    return document.documentElement.classList.contains('dark')
  }
  return false
}

// Utility to get current theme based on mode
export function getCurrentTheme() {
  return isDarkMode() ? CHART_THEME.dark : CHART_THEME.light
}

// Format number with locale and precision
export function formatNumber(value: number, options: Intl.NumberFormatOptions = {}): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
    ...options
  })
} 