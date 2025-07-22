export const CONSTRUCTION_PHASES_WITH_TASKS = {
    'PRE_CONSTRUCTION': {
      description: 'All activities before physical construction begins',
      tasks: [
        {
          id: 'site_acquisition',
          name: 'Site Acquisition'
        },
        {
          id: 'architectural_design',
          name: 'Architectural Design'
        },
        {
          id: 'structural_design',
          name: 'Structural Engineering'
        },
        {
          id: 'permits',
          name: 'Permits & Approvals'
        },
        {
          id: 'contractor_selection',
          name: 'Contractor Selection'
        }
      ]
    },
  
    'SITE_PREPARATION': {
      description: 'Preparing the site for construction',
      tasks: [
        {
          id: 'site_clearing',
          name: 'Site Clearing'
        },
        {
          id: 'surveying',
          name: 'Surveying & Setting Out'
        },
        {
          id: 'temporary_facilities',
          name: 'Temporary Facilities'
        },
        {
          id: 'excavation',
          name: 'Excavation'
        },
        {
          id: 'soil_treatment',
          name: 'Soil Treatment'
        }
      ]
    },
  
    'FOUNDATION': {
      description: 'Building the foundation system',
      tasks: [
        {
          id: 'foundation_excavation',
          name: 'Foundation Excavation'
        },
        {
          id: 'lean_concrete',
          name: 'Lean Concrete/Blinding'
        },
        {
          id: 'reinforcement',
          name: 'Foundation Reinforcement'
        },
        {
          id: 'foundation_concrete',
          name: 'Foundation Concrete Pour'
        },
        {
          id: 'waterproofing',
          name: 'Waterproofing/DPC'
        },
        {
          id: 'backfilling',
          name: 'Backfilling'
        }
      ]
    },
  
    'STRUCTURAL_FRAME': {
      description: 'Main structural elements above foundation',
      tasks: [
        {
          id: 'columns',
          name: 'Columns/Posts'
        },
        {
          id: 'beams',
          name: 'Beams & Lintels'
        },
        {
          id: 'floor_slabs',
          name: 'Floor Slabs'
        },
        {
          id: 'stairs',
          name: 'Staircase Construction'
        },
        {
          id: 'lift_shaft',
          name: 'Lift/Elevator Shaft'
        }
      ]
    },
  
    'WALLS_AND_PARTITIONS': {
      description: 'Building walls and internal partitions',
      tasks: [
        {
          id: 'external_walls',
          name: 'External Wall Construction'
        },
        {
          id: 'internal_walls',
          name: 'Internal Partitions'
        },
        {
          id: 'wall_ties',
          name: 'Wall Ties & Reinforcement'
        },
        {
          id: 'openings',
          name: 'Door & Window Openings'
        }
      ]
    },
  
    'ROOFING': {
      description: 'Complete roofing system',
      tasks: [
        {
          id: 'roof_structure',
          name: 'Roof Structure'
        },
        {
          id: 'roof_deck',
          name: 'Roof Decking'
        },
        {
          id: 'roof_insulation',
          name: 'Roof Insulation'
        },
        {
          id: 'roof_membrane',
          name: 'Waterproof Membrane'
        },
        {
          id: 'roof_covering',
          name: 'Roof Covering'
        },
        {
          id: 'roof_drainage',
          name: 'Gutters & Downpipes'
        }
      ]
    },
  
    'BUILDING_ENVELOPE': {
      description: 'External building enclosure',
      tasks: [
        {
          id: 'external_render',
          name: 'External Rendering/Plastering'
        },
        {
          id: 'cladding',
          name: 'External Cladding'
        },
        {
          id: 'windows',
          name: 'Window Installation'
        },
        {
          id: 'external_doors',
          name: 'External Door Installation'
        },
        {
          id: 'weather_sealing',
          name: 'Weather Sealing'
        }
      ]
    },
  
    'MEP_ROUGH_IN': {
      description: 'Mechanical, Electrical, and Plumbing rough installation',
      tasks: [
        {
          id: 'electrical_conduits',
          name: 'Electrical Conduits & Wiring'
        },
        {
          id: 'plumbing_pipes',
          name: 'Plumbing Pipes'
        },
        {
          id: 'hvac_ducts',
          name: 'HVAC Ductwork'
        },
        {
          id: 'fire_systems',
          name: 'Fire Protection Systems'
        },
        {
          id: 'data_cabling',
          name: 'Data & Communication Cabling'
        }
      ]
    },
  
    'INTERIOR_CONSTRUCTION': {
      description: 'Interior construction before finishes',
      tasks: [
        {
          id: 'insulation',
          name: 'Wall & Ceiling Insulation'
        },
        {
          id: 'drywall',
          name: 'Drywall/Plasterboard'
        },
        {
          id: 'plastering',
          name: 'Internal Plastering'
        },
        {
          id: 'screeding',
          name: 'Floor Screeding'
        },
        {
          id: 'ceiling_framing',
          name: 'Ceiling Framework'
        }
      ]
    },
  
    'INTERIOR_FINISHES': {
      description: 'All interior finishing work',
      tasks: [
        {
          id: 'wall_primer',
          name: 'Primer/Sealer Application'
        },
        {
          id: 'painting',
          name: 'Interior Painting'
        },
        {
          id: 'wall_tiles',
          name: 'Wall Tiling'
        },
        {
          id: 'flooring',
          name: 'Floor Finishes'
        },
        {
          id: 'ceiling_finish',
          name: 'Ceiling Finishes'
        },
        {
          id: 'skirting',
          name: 'Skirting & Architraves'
        }
      ]
    },
  
    'FIXTURES_AND_FITTINGS': {
      description: 'Installing all fixtures and fittings',
      tasks: [
        {
          id: 'internal_doors',
          name: 'Internal Doors'
        },
        {
          id: 'kitchen_cabinets',
          name: 'Kitchen Installation'
        },
        {
          id: 'bathroom_fixtures',
          name: 'Bathroom Fixtures'
        },
        {
          id: 'electrical_fixtures',
          name: 'Electrical Fixtures'
        },
        {
          id: 'built_in_furniture',
          name: 'Built-in Furniture'
        },
        {
          id: 'appliances',
          name: 'Appliance Installation'
        }
      ]
    },
  
    'EXTERNAL_WORKS': {
      description: 'All external development work',
      tasks: [
        {
          id: 'boundary_walls',
          name: 'Boundary Walls/Fencing'
        },
        {
          id: 'gates',
          name: 'Gates Installation'
        },
        {
          id: 'driveways',
          name: 'Driveways & Parking'
        },
        {
          id: 'walkways',
          name: 'Walkways & Paths'
        },
        {
          id: 'drainage',
          name: 'External Drainage'
        },
        {
          id: 'landscaping',
          name: 'Soft Landscaping'
        },
        {
          id: 'external_lighting',
          name: 'External Lighting'
        }
      ]
    },
  
    'SPECIALIZED_INSTALLATIONS': {
      description: 'Specialized or optional installations',
      tasks: [
        {
          id: 'swimming_pool',
          name: 'Swimming Pool'
        },
        {
          id: 'solar_panels',
          name: 'Solar System'
        },
        {
          id: 'home_automation',
          name: 'Smart Home Systems'
        },
        {
          id: 'security_systems',
          name: 'Security Systems'
        },
        {
          id: 'elevator',
          name: 'Elevator/Lift Installation'
        },
        {
          id: 'generator',
          name: 'Backup Power'
        }
      ]
    },
  
    'TESTING_AND_COMMISSIONING': {
      description: 'Testing all systems and quality checks',
      tasks: [
        {
          id: 'electrical_testing',
          name: 'Electrical Testing'
        },
        {
          id: 'plumbing_testing',
          name: 'Plumbing Testing'
        },
        {
          id: 'hvac_commissioning',
          name: 'HVAC Commissioning'
        },
        {
          id: 'fire_system_testing',
          name: 'Fire System Testing'
        },
        {
          id: 'snagging',
          name: 'Snagging/Punch List'
        }
      ]
    },
  
    'PROJECT_COMPLETION': {
      description: 'Final completion and handover activities',
      tasks: [
        {
          id: 'final_cleaning',
          name: 'Final Cleaning'
        },
        {
          id: 'final_inspections',
          name: 'Authority Inspections'
        },
        {
          id: 'documentation',
          name: 'Documentation Handover'
        },
        {
          id: 'training',
          name: 'User Training'
        },
        {
          id: 'handover',
          name: 'Keys Handover'
        }
      ]
    },
  
    // Remodeling-Specific Phases
    'DEMOLITION_AND_STRIP_OUT': {
      description: 'Removing existing elements (for remodeling projects)',
      isRemodelingPhase: true,
      tasks: [
        {
          id: 'soft_strip',
          name: 'Soft Strip Out'
        },
        {
          id: 'structural_demolition',
          name: 'Structural Demolition'
        },
        {
          id: 'hazmat_removal',
          name: 'Hazardous Material Removal'
        },
        {
          id: 'salvage',
          name: 'Salvage Operations'
        }
      ]
    },
  
    'STRUCTURAL_MODIFICATIONS': {
      description: 'Modifying existing structure (for remodeling)',
      isRemodelingPhase: true,
      tasks: [
        {
          id: 'temporary_support',
          name: 'Temporary Structural Support'
        },
        {
          id: 'new_openings',
          name: 'Creating New Openings'
        },
        {
          id: 'structural_reinforcement',
          name: 'Structural Reinforcement'
        },
        {
          id: 'extensions',
          name: 'Building Extensions'
        }
      ]
    }
  };
  
  // Define types for better TypeScript support
  export type ProjectType = 'residential-single' | 'residential-multi' | 'commercial' | 'renovation';
  
  export interface PhaseTemplate {
    description: string;
    tasks: {
      id: string;
      name: string;
    }[];
    isRemodelingPhase?: boolean;
  }
  
  // Helper function to get phases for specific project type
  export function getPhasesForProjectType(projectType: ProjectType): [string, PhaseTemplate][] {
    const allPhases = Object.entries(CONSTRUCTION_PHASES_WITH_TASKS) as [string, PhaseTemplate][];
    
    if (projectType === 'residential-single' || projectType === 'residential-multi' || projectType === 'commercial') {
      // For new construction projects, exclude remodeling-specific phases
      return allPhases.filter(([_key, phase]) => !phase.isRemodelingPhase);
    } else if (projectType === 'renovation') {
      // For renovation projects, include demolition and modification phases plus core construction phases
      return allPhases.filter(([key, phase]) => {
        const corePhases = ['PRE_CONSTRUCTION', 'MEP_ROUGH_IN', 'INTERIOR_CONSTRUCTION', 
                           'INTERIOR_FINISHES', 'FIXTURES_AND_FITTINGS', 'TESTING_AND_COMMISSIONING', 
                           'PROJECT_COMPLETION'];
        return phase.isRemodelingPhase || corePhases.includes(key);
      });
    }
    
    return allPhases; // Return all phases for unspecified project types
  }