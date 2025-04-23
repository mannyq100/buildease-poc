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

// Sample markdown project plan for the AI-generated output view
export const markdownPlan = `# Construction Project Plan

## Pre-Construction Phase (4-6 weeks)
Initial planning, design, and preparation before construction begins.

### Tasks:
- Site analysis and evaluation
- Architectural design finalization
- Obtain necessary permits
- Contractor selection

### Materials:
- Survey equipment: 1 set ($500)
- Permit application fees: 1 lot ($2,500)

## Foundation Phase (3-4 weeks)
Establishing the structural foundation of the building.

### Tasks:
- Site clearing and excavation
- Foundation layout
- Concrete pouring
- Waterproofing

### Materials:
- Concrete: 30 cubic yards ($4,500)
- Rebar: 2 tons ($2,200)
- Waterproofing membrane: 500 sq ft ($1,500)

## Framing Phase (4-5 weeks)
Construction of the structural framework.

### Tasks:
- Wall framing
- Roof framing
- Window and door installation

### Materials:
- Lumber: 5000 board feet ($7,500)
- Roof trusses: 24 pieces ($4,800)
- Window frames: 12 pieces ($3,600)
- Door frames: 8 pieces ($1,600)
`