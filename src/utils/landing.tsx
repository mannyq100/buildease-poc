import React from 'react'
import { Feature, FeatureData } from '@/types/landing'
import {
  LayoutDashboard,
  Wallet,
  CalendarCheck,
  ListChecks,
  Users,
  FileText,
  BarChart3,
  Smartphone,
  ShieldCheck,
} from 'lucide-react'

export function createFeatureWithIcon(featureData: FeatureData): Feature {
  // Prefer lucide-react icons via iconName
  let icon = null as React.ReactNode

  const iconMap: Record<NonNullable<FeatureData['iconName']>, React.ComponentType<{ className?: string }>> = {
    dashboard: LayoutDashboard,
    budget: Wallet,
    phases: ListChecks,
    schedule: CalendarCheck,
    team: Users,
    documents: FileText,
    reports: BarChart3,
    mobile: Smartphone,
    security: ShieldCheck,
  }

  if (featureData.iconName && iconMap[featureData.iconName]) {
    const Icon = iconMap[featureData.iconName]
    icon = <Icon className="w-8 h-8 text-gray-700" />
  } else if (featureData.iconPath) {
    // Fallback to provided SVG path
    icon = (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-8 h-8 text-gray-700"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={featureData.iconPath} />
      </svg>
    )
  }

  return {
    ...featureData,
    icon,
  }
}

export function createFeaturesWithIcons(featuresData: FeatureData[]): Feature[] {
  return featuresData.map(createFeatureWithIcon)
}