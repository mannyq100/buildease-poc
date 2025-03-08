/**
 * Insights data for the GeneratedPlan component
 * These insights provide context and recommendations for the construction timeline
 */

import { InsightItemProps } from '@/types/projectInputs';

// Define the insight items for the timeline view
export const TIMELINE_INSIGHTS: InsightItemProps[] = [
  {
    title: "Construction Schedule",
    description: "The timeline follows local construction best practices with contingency planning for weather delays.",
    type: "default",
    animationDelay: 0.1
  },
  {
    title: "Milestone Planning",
    description: "Critical path analysis shows key dependencies between phases to minimize delays.",
    type: "success",
    animationDelay: 0.2
  },
  {
    title: "Seasonal Considerations",
    description: "Foundation work scheduled outside rainy season (April-July) to avoid delays.",
    type: "warning",
    animationDelay: 0.3
  }
];

// Additional insights for other views if needed
export const BUDGET_INSIGHTS: InsightItemProps[] = [
  {
    title: "Cost Efficiency",
    description: "Bulk purchasing of materials for multiple phases can reduce overall costs by 8-12%.",
    type: "success",
    animationDelay: 0.1
  },
  {
    title: "Budget Allocation",
    description: "60% materials, 25% labor, 10% equipment, 5% contingency is the recommended split.",
    type: "default",
    animationDelay: 0.2
  },
  {
    title: "Cost Risks",
    description: "Material price volatility may affect budget. Consider fixed-price contracts where possible.",
    type: "warning",
    animationDelay: 0.3
  }
];

export const MATERIALS_INSIGHTS: InsightItemProps[] = [
  {
    title: "Local Sourcing",
    description: "Local materials reduce transportation costs and support the community economy.",
    type: "success",
    animationDelay: 0.1
  },
  {
    title: "Storage Planning",
    description: "Secure, weatherproof storage needed for all materials to prevent damage.",
    type: "default",
    animationDelay: 0.2
  },
  {
    title: "Sustainable Options",
    description: "Consider recycled materials and sustainable alternatives where applicable.",
    type: "default",
    animationDelay: 0.3
  }
]; 