// src/data/sampleProjectPlan.ts
import { Phase } from '@/types/projectInputs'

export const SAMPLE_PROJECT_PLAN: Phase[] = [
  {
    id: '1',
    title: 'Pre-Construction Phase',
    description: 'Initial planning, design, and preparation before construction begins',
    duration: '4-6 weeks',
    tasks: [
      { id: '1-1', title: 'Site analysis and evaluation', description: 'Assess site conditions, topography, and existing structures', completed: false },
      { id: '1-2', title: 'Architectural design finalization', description: 'Complete all architectural drawings and specifications', completed: false },
      { id: '1-3', title: 'Obtain necessary permits', description: 'Apply for and secure all required building permits and approvals', completed: false },
      { id: '1-4', title: 'Contractor selection', description: 'Evaluate bids and select primary contractors', completed: false }
    ],
    materials: [
      { id: 'm1-1', name: 'Survey equipment', quantity: '1 set', unit: 'set', cost: 500 },
      { id: 'm1-2', name: 'Permit application fees', quantity: '1', unit: 'lot', cost: 2500 }
    ]
  },
  {
    id: '2',
    title: 'Foundation Phase',
    description: 'Establishing the structural foundation of the building',
    duration: '3-4 weeks',
    tasks: [
      { id: '2-1', title: 'Site clearing and excavation', description: 'Remove vegetation and excavate for foundation', completed: false },
      { id: '2-2', title: 'Foundation layout', description: 'Mark and measure foundation dimensions', completed: false },
      { id: '2-3', title: 'Concrete pouring', description: 'Pour concrete for foundation and footings', completed: false },
      { id: '2-4', title: 'Waterproofing', description: 'Apply waterproofing materials to foundation', completed: false }
    ],
    materials: [
      { id: 'm2-1', name: 'Concrete', quantity: '30', unit: 'cubic yards', cost: 4500 },
      { id: 'm2-2', name: 'Rebar', quantity: '2', unit: 'tons', cost: 2200 },
      { id: 'm2-3', name: 'Waterproofing membrane', quantity: '500', unit: 'sq ft', cost: 1500 }
    ]
  },
  {
    id: '3',
    title: 'Framing Phase',
    description: 'Construction of the structural framework',
    duration: '4-5 weeks',
    tasks: [
      { id: '3-1', title: 'Wall framing', description: 'Construct exterior and interior wall frames', completed: false },
      { id: '3-2', title: 'Roof framing', description: 'Install roof trusses and sheathing', completed: false },
      { id: '3-3', title: 'Window and door installation', description: 'Install window and door frames', completed: false }
    ],
    materials: [
      { id: 'm3-1', name: 'Lumber', quantity: '5000', unit: 'board feet', cost: 7500 },
      { id: 'm3-2', name: 'Roof trusses', quantity: '24', unit: 'pieces', cost: 4800 },
      { id: 'm3-3', name: 'Window frames', quantity: '12', unit: 'pieces', cost: 3600 },
      { id: 'm3-4', name: 'Door frames', quantity: '8', unit: 'pieces', cost: 1600 }
    ]
  }
]

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