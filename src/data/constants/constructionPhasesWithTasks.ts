export const CONSTRUCTION_PHASES_WITH_TASKS = {
    'PRE_CONSTRUCTION': {
      alternativeNames: ['Planning Phase', 'Design Phase', 'Preparatory Works'],
      description: 'All activities before physical construction begins',
      tasks: [
        {
          id: 'site_acquisition',
          name: 'Site Acquisition',
          alternativeNames: ['Land Purchase', 'Plot Acquisition']
        },
        {
          id: 'architectural_design',
          name: 'Architectural Design',
          alternativeNames: ['Design Development', 'Schematic Design']
        },
        {
          id: 'structural_design',
          name: 'Structural Engineering',
          alternativeNames: ['Structural Calculations', 'Engineering Design']
        },
        {
          id: 'permits',
          name: 'Permits & Approvals',
          alternativeNames: ['Building Permits', 'Planning Permission', 'Building Consent']
        },
        {
          id: 'contractor_selection',
          name: 'Contractor Selection',
          alternativeNames: ['Tender Process', 'Bidding', 'Procurement']
        }
      ]
    },
  
    'SITE_PREPARATION': {
      alternativeNames: ['Site Works', 'Ground Preparation', 'Site Setup'],
      description: 'Preparing the site for construction',
      tasks: [
        {
          id: 'site_clearing',
          name: 'Site Clearing',
          alternativeNames: ['Bush Clearing', 'Vegetation Removal', 'Demolition']
        },
        {
          id: 'surveying',
          name: 'Surveying & Setting Out',
          alternativeNames: ['Site Survey', 'Plot Demarcation', 'Staking']
        },
        {
          id: 'temporary_facilities',
          name: 'Temporary Facilities',
          alternativeNames: ['Site Office', 'Storage Setup', 'Utilities Connection']
        },
        {
          id: 'excavation',
          name: 'Excavation',
          alternativeNames: ['Earthworks', 'Digging', 'Trenching']
        },
        {
          id: 'soil_treatment',
          name: 'Soil Treatment',
          alternativeNames: ['Termite Treatment', 'Soil Stabilization']
        }
      ]
    },
  
    'FOUNDATION': {
      alternativeNames: ['Substructure', 'Base Construction', 'Footings'],
      description: 'Building the foundation system',
      tasks: [
        {
          id: 'foundation_excavation',
          name: 'Foundation Excavation',
          alternativeNames: ['Footing Excavation', 'Trench Digging']
        },
        {
          id: 'lean_concrete',
          name: 'Lean Concrete/Blinding',
          alternativeNames: ['Mud Mat', 'Leveling Course']
        },
        {
          id: 'reinforcement',
          name: 'Foundation Reinforcement',
          alternativeNames: ['Rebar Installation', 'Steel Fixing']
        },
        {
          id: 'foundation_concrete',
          name: 'Foundation Concrete Pour',
          alternativeNames: ['Footing Concrete', 'Base Concrete']
        },
        {
          id: 'waterproofing',
          name: 'Waterproofing/DPC',
          alternativeNames: ['Damp Proof Course', 'Moisture Barrier', 'Tanking']
        },
        {
          id: 'backfilling',
          name: 'Backfilling',
          alternativeNames: ['Earth Filling', 'Soil Replacement']
        }
      ]
    },
  
    'STRUCTURAL_FRAME': {
      alternativeNames: ['Superstructure', 'Structural Work', 'Frame Construction'],
      description: 'Main structural elements above foundation',
      tasks: [
        {
          id: 'columns',
          name: 'Columns/Posts',
          alternativeNames: ['Pillars', 'Vertical Members', 'Uprights']
        },
        {
          id: 'beams',
          name: 'Beams & Lintels',
          alternativeNames: ['Horizontal Members', 'Ring Beams', 'Headers']
        },
        {
          id: 'floor_slabs',
          name: 'Floor Slabs',
          alternativeNames: ['Suspended Floors', 'Concrete Decking', 'Floor System']
        },
        {
          id: 'stairs',
          name: 'Staircase Construction',
          alternativeNames: ['Stairs', 'Steps', 'Stairway']
        },
        {
          id: 'lift_shaft',
          name: 'Lift/Elevator Shaft',
          alternativeNames: ['Elevator Core', 'Lift Well']
        }
      ]
    },
  
    'WALLS_AND_PARTITIONS': {
      alternativeNames: ['Masonry Work', 'Wall Construction', 'Enclosure'],
      description: 'Building walls and internal partitions',
      tasks: [
        {
          id: 'external_walls',
          name: 'External Wall Construction',
          alternativeNames: ['Perimeter Walls', 'Load Bearing Walls', 'Brick/Block Work']
        },
        {
          id: 'internal_walls',
          name: 'Internal Partitions',
          alternativeNames: ['Partition Walls', 'Room Divisions', 'Non-Load Bearing Walls']
        },
        {
          id: 'wall_ties',
          name: 'Wall Ties & Reinforcement',
          alternativeNames: ['Wall Connectors', 'Structural Ties']
        },
        {
          id: 'openings',
          name: 'Door & Window Openings',
          alternativeNames: ['Wall Openings', 'Fenestration Prep']
        }
      ]
    },
  
    'ROOFING': {
      alternativeNames: ['Roof Construction', 'Roof Works', 'Top Structure'],
      description: 'Complete roofing system',
      tasks: [
        {
          id: 'roof_structure',
          name: 'Roof Structure',
          alternativeNames: ['Roof Framing', 'Trusses', 'Rafters', 'Roof Skeleton']
        },
        {
          id: 'roof_deck',
          name: 'Roof Decking',
          alternativeNames: ['Roof Sheathing', 'Roof Boarding', 'Substrate']
        },
        {
          id: 'roof_insulation',
          name: 'Roof Insulation',
          alternativeNames: ['Thermal Barrier', 'Roof Batting']
        },
        {
          id: 'roof_membrane',
          name: 'Waterproof Membrane',
          alternativeNames: ['Roof Felt', 'Underlayment', 'Vapor Barrier']
        },
        {
          id: 'roof_covering',
          name: 'Roof Covering',
          alternativeNames: ['Tiles', 'Shingles', 'Metal Sheets', 'Roof Cladding']
        },
        {
          id: 'roof_drainage',
          name: 'Gutters & Downpipes',
          alternativeNames: ['Rainwater Goods', 'Roof Drainage', 'Storm Water']
        }
      ]
    },
  
    'BUILDING_ENVELOPE': {
      alternativeNames: ['External Finishes', 'Weatherproofing', 'Façade'],
      description: 'External building enclosure',
      tasks: [
        {
          id: 'external_render',
          name: 'External Rendering/Plastering',
          alternativeNames: ['Stucco', 'External Plaster', 'Roughcast']
        },
        {
          id: 'cladding',
          name: 'External Cladding',
          alternativeNames: ['Siding', 'Façade Panels', 'Weather Board']
        },
        {
          id: 'windows',
          name: 'Window Installation',
          alternativeNames: ['Glazing', 'Fenestration', 'Window Fitting']
        },
        {
          id: 'external_doors',
          name: 'External Door Installation',
          alternativeNames: ['Entry Doors', 'Main Doors', 'Access Doors']
        },
        {
          id: 'weather_sealing',
          name: 'Weather Sealing',
          alternativeNames: ['Caulking', 'Sealing', 'Weatherstripping']
        }
      ]
    },
  
    'MEP_ROUGH_IN': {
      alternativeNames: ['Services First Fix', 'Rough Services', 'MEP Installation'],
      description: 'Mechanical, Electrical, and Plumbing rough installation',
      tasks: [
        {
          id: 'electrical_conduits',
          name: 'Electrical Conduits & Wiring',
          alternativeNames: ['Cable Laying', 'Wire Pulling', 'Electrical Rough']
        },
        {
          id: 'plumbing_pipes',
          name: 'Plumbing Pipes',
          alternativeNames: ['Water Lines', 'Drainage Pipes', 'Sanitary Rough']
        },
        {
          id: 'hvac_ducts',
          name: 'HVAC Ductwork',
          alternativeNames: ['Air Conditioning Ducts', 'Ventilation', 'Mechanical Rough']
        },
        {
          id: 'fire_systems',
          name: 'Fire Protection Systems',
          alternativeNames: ['Sprinklers', 'Fire Pipes', 'Fire Safety']
        },
        {
          id: 'data_cabling',
          name: 'Data & Communication Cabling',
          alternativeNames: ['IT Infrastructure', 'Network Cabling', 'Telecom']
        }
      ]
    },
  
    'INTERIOR_CONSTRUCTION': {
      alternativeNames: ['Interior Works', 'Internal Construction', 'Fit-Out Prep'],
      description: 'Interior construction before finishes',
      tasks: [
        {
          id: 'insulation',
          name: 'Wall & Ceiling Insulation',
          alternativeNames: ['Thermal Insulation', 'Acoustic Insulation', 'Batting']
        },
        {
          id: 'drywall',
          name: 'Drywall/Plasterboard',
          alternativeNames: ['Gypsum Board', 'Sheetrock', 'Wall Lining']
        },
        {
          id: 'plastering',
          name: 'Internal Plastering',
          alternativeNames: ['Skim Coating', 'Wall Rendering', 'Cement Plaster']
        },
        {
          id: 'screeding',
          name: 'Floor Screeding',
          alternativeNames: ['Floor Leveling', 'Cement Screed', 'Floor Topping']
        },
        {
          id: 'ceiling_framing',
          name: 'Ceiling Framework',
          alternativeNames: ['False Ceiling Frame', 'Suspended Ceiling Grid']
        }
      ]
    },
  
    'INTERIOR_FINISHES': {
      alternativeNames: ['Finishing Works', 'Final Finishes', 'Decoration'],
      description: 'All interior finishing work',
      tasks: [
        {
          id: 'wall_primer',
          name: 'Primer/Sealer Application',
          alternativeNames: ['Base Coat', 'Primer Coat', 'Sealer']
        },
        {
          id: 'painting',
          name: 'Interior Painting',
          alternativeNames: ['Wall Painting', 'Decoration', 'Color Application']
        },
        {
          id: 'wall_tiles',
          name: 'Wall Tiling',
          alternativeNames: ['Ceramic Installation', 'Wall Tiles', 'Backsplash']
        },
        {
          id: 'flooring',
          name: 'Floor Finishes',
          alternativeNames: ['Floor Tiles', 'Wood Flooring', 'Carpet', 'Vinyl']
        },
        {
          id: 'ceiling_finish',
          name: 'Ceiling Finishes',
          alternativeNames: ['Ceiling Tiles', 'Ceiling Paint', 'Decorative Ceiling']
        },
        {
          id: 'skirting',
          name: 'Skirting & Architraves',
          alternativeNames: ['Baseboards', 'Trim Work', 'Moldings']
        }
      ]
    },
  
    'FIXTURES_AND_FITTINGS': {
      alternativeNames: ['Final Fix', 'Second Fix', 'Fit-Out'],
      description: 'Installing all fixtures and fittings',
      tasks: [
        {
          id: 'internal_doors',
          name: 'Internal Doors',
          alternativeNames: ['Room Doors', 'Interior Doors', 'Door Hanging']
        },
        {
          id: 'kitchen_cabinets',
          name: 'Kitchen Installation',
          alternativeNames: ['Kitchen Units', 'Cabinetry', 'Kitchen Fit-Out']
        },
        {
          id: 'bathroom_fixtures',
          name: 'Bathroom Fixtures',
          alternativeNames: ['Sanitary Ware', 'Plumbing Fixtures', 'White Goods']
        },
        {
          id: 'electrical_fixtures',
          name: 'Electrical Fixtures',
          alternativeNames: ['Light Fittings', 'Switches/Sockets', 'Electrical Final']
        },
        {
          id: 'built_in_furniture',
          name: 'Built-in Furniture',
          alternativeNames: ['Wardrobes', 'Closets', 'Custom Millwork']
        },
        {
          id: 'appliances',
          name: 'Appliance Installation',
          alternativeNames: ['White Goods', 'Kitchen Appliances', 'Equipment']
        }
      ]
    },
  
    'EXTERNAL_WORKS': {
      alternativeNames: ['Site Development', 'Landscaping', 'Compound Works'],
      description: 'All external development work',
      tasks: [
        {
          id: 'boundary_walls',
          name: 'Boundary Walls/Fencing',
          alternativeNames: ['Perimeter Wall', 'Compound Wall', 'Security Fence']
        },
        {
          id: 'gates',
          name: 'Gates Installation',
          alternativeNames: ['Main Gate', 'Entrance Gates', 'Driveway Gates']
        },
        {
          id: 'driveways',
          name: 'Driveways & Parking',
          alternativeNames: ['Vehicle Access', 'Car Park', 'Hardstanding']
        },
        {
          id: 'walkways',
          name: 'Walkways & Paths',
          alternativeNames: ['Footpaths', 'Pavements', 'Pedestrian Access']
        },
        {
          id: 'drainage',
          name: 'External Drainage',
          alternativeNames: ['Storm Drains', 'Surface Water', 'Soakaways']
        },
        {
          id: 'landscaping',
          name: 'Soft Landscaping',
          alternativeNames: ['Gardens', 'Planting', 'Lawn Installation']
        },
        {
          id: 'external_lighting',
          name: 'External Lighting',
          alternativeNames: ['Garden Lights', 'Security Lighting', 'Landscape Lighting']
        }
      ]
    },
  
    'SPECIALIZED_INSTALLATIONS': {
      alternativeNames: ['Special Systems', 'Additional Features', 'Optional Installations'],
      description: 'Specialized or optional installations',
      tasks: [
        {
          id: 'swimming_pool',
          name: 'Swimming Pool',
          alternativeNames: ['Pool Construction', 'Aquatic Features']
        },
        {
          id: 'solar_panels',
          name: 'Solar System',
          alternativeNames: ['PV Installation', 'Solar Power', 'Renewable Energy']
        },
        {
          id: 'home_automation',
          name: 'Smart Home Systems',
          alternativeNames: ['Building Automation', 'IoT Systems', 'Home Intelligence']
        },
        {
          id: 'security_systems',
          name: 'Security Systems',
          alternativeNames: ['CCTV', 'Alarm Systems', 'Access Control']
        },
        {
          id: 'elevator',
          name: 'Elevator/Lift Installation',
          alternativeNames: ['Lift Installation', 'Vertical Transport']
        },
        {
          id: 'generator',
          name: 'Backup Power',
          alternativeNames: ['Generator Installation', 'UPS Systems', 'Emergency Power']
        }
      ]
    },
  
    'TESTING_AND_COMMISSIONING': {
      alternativeNames: ['Quality Control', 'Systems Testing', 'Pre-Handover'],
      description: 'Testing all systems and quality checks',
      tasks: [
        {
          id: 'electrical_testing',
          name: 'Electrical Testing',
          alternativeNames: ['Circuit Testing', 'Electrical Certification']
        },
        {
          id: 'plumbing_testing',
          name: 'Plumbing Testing',
          alternativeNames: ['Pressure Testing', 'Leak Testing', 'Water Quality']
        },
        {
          id: 'hvac_commissioning',
          name: 'HVAC Commissioning',
          alternativeNames: ['Air Balance', 'System Testing', 'Performance Testing']
        },
        {
          id: 'fire_system_testing',
          name: 'Fire System Testing',
          alternativeNames: ['Fire Alarm Testing', 'Sprinkler Testing']
        },
        {
          id: 'snagging',
          name: 'Snagging/Punch List',
          alternativeNames: ['Defects List', 'Quality Inspection', 'Final Walkthrough']
        }
      ]
    },
  
    'PROJECT_COMPLETION': {
      alternativeNames: ['Handover', 'Project Closeout', 'Final Phase'],
      description: 'Final completion and handover activities',
      tasks: [
        {
          id: 'final_cleaning',
          name: 'Final Cleaning',
          alternativeNames: ['Deep Cleaning', 'Construction Cleanup', 'Move-in Ready']
        },
        {
          id: 'final_inspections',
          name: 'Authority Inspections',
          alternativeNames: ['Building Control', 'Compliance Inspection', 'COC']
        },
        {
          id: 'documentation',
          name: 'Documentation Handover',
          alternativeNames: ['O&M Manuals', 'As-Built Drawings', 'Warranties']
        },
        {
          id: 'training',
          name: 'User Training',
          alternativeNames: ['System Training', 'Maintenance Training']
        },
        {
          id: 'handover',
          name: 'Keys Handover',
          alternativeNames: ['Project Delivery', 'Occupancy', 'Practical Completion']
        }
      ]
    },
  
    // Remodeling-Specific Phases
    'DEMOLITION_AND_STRIP_OUT': {
      alternativeNames: ['Demolition Phase', 'Deconstruction', 'Strip Out'],
      description: 'Removing existing elements (for remodeling projects)',
      isRemodelingPhase: true,
      tasks: [
        {
          id: 'soft_strip',
          name: 'Soft Strip Out',
          alternativeNames: ['Non-Structural Removal', 'Interior Strip']
        },
        {
          id: 'structural_demolition',
          name: 'Structural Demolition',
          alternativeNames: ['Wall Removal', 'Structural Alterations']
        },
        {
          id: 'hazmat_removal',
          name: 'Hazardous Material Removal',
          alternativeNames: ['Asbestos Removal', 'Lead Paint Removal']
        },
        {
          id: 'salvage',
          name: 'Salvage Operations',
          alternativeNames: ['Material Recovery', 'Recycling']
        }
      ]
    },
  
    'STRUCTURAL_MODIFICATIONS': {
      alternativeNames: ['Structural Alterations', 'Renovation Structure'],
      description: 'Modifying existing structure (for remodeling)',
      isRemodelingPhase: true,
      tasks: [
        {
          id: 'temporary_support',
          name: 'Temporary Structural Support',
          alternativeNames: ['Shoring', 'Propping', 'Temporary Works']
        },
        {
          id: 'new_openings',
          name: 'Creating New Openings',
          alternativeNames: ['Wall Openings', 'Door/Window Additions']
        },
        {
          id: 'structural_reinforcement',
          name: 'Structural Reinforcement',
          alternativeNames: ['Strengthening', 'Retrofitting', 'Upgrading']
        },
        {
          id: 'extensions',
          name: 'Building Extensions',
          alternativeNames: ['Additions', 'Expansions', 'New Wings']
        }
      ]
    }
  };
  
  // Helper function to get phases for specific project type
  function getPhasesForProjectType(projectType) {
    const allPhases = Object.entries(CONSTRUCTION_PHASES_WITH_TASKS);
    
    if (projectType === 'new_construction') {
      return allPhases.filter(([key, phase]) => !phase.isRemodelingPhase);
    } else if (projectType === 'remodeling') {
      // Include demolition and modification phases for remodeling
      return allPhases.filter(([key, phase]) => {
        const corePhases = ['PRE_CONSTRUCTION', 'MEP_ROUGH_IN', 'INTERIOR_CONSTRUCTION', 
                           'INTERIOR_FINISHES', 'FIXTURES_AND_FITTINGS', 'TESTING_AND_COMMISSIONING', 
                           'PROJECT_COMPLETION'];
        return phase.isRemodelingPhase || corePhases.includes(key);
      });
    }
    
    return allPhases; // Return all for 'both' or unspecified
  }