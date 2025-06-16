import { Feature, FeatureData } from '@/types/landing'

export function createFeatureWithIcon(featureData: FeatureData): Feature {
  return {
    ...featureData,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={featureData.iconPath} />
      </svg>
    ),
  }
}

export function createFeaturesWithIcons(featuresData: FeatureData[]): Feature[] {
  return featuresData.map(createFeatureWithIcon)
}