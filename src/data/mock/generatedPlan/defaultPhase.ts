/**
 * Default phase structure for the GeneratedPlan component
 * Used when adding a new empty phase
 */

import { Phase } from '@/types/projectInputs';

/**
 * Creates a new empty phase with default values
 * @param phaseNumber The phase number to use in the title
 * @returns A new Phase object with default values
 */
export const createDefaultPhase = (phaseNumber: number): Phase => {
  return {
    id: `phase-${Date.now()}`,
    title: `New Phase ${phaseNumber}`,
    duration: '2-3 weeks',
    description: '',
    tasks: [],
    materials: []
  };
};

/**
 * Common task templates that can be added to phases
 */
export const COMMON_TASK_TEMPLATES = [
  {
    title: 'Planning and Permits',
    description: 'Obtain necessary approvals and permits for construction',
    tasks: [
      { title: 'Submit permit applications', description: 'Complete and submit all required permit applications' },
      { title: 'Obtain building permit', description: 'Secure official building permit from local authorities' },
      { title: 'Conduct site survey', description: 'Complete professional survey of the construction site' }
    ]
  },
  {
    title: 'Site Preparation',
    description: 'Prepare the site for construction activities',
    tasks: [
      { title: 'Clear vegetation', description: 'Remove trees, shrubs, and other vegetation from the construction area' },
      { title: 'Level the ground', description: 'Grade and level the construction site' },
      { title: 'Set up temporary facilities', description: 'Install site office, toilets, and storage areas' }
    ]
  },
  {
    title: 'Foundation Work',
    description: 'Construct the foundation of the building',
    tasks: [
      { title: 'Excavate foundation', description: 'Dig foundation trenches or pits according to plan' },
      { title: 'Install reinforcement', description: 'Place rebar and other reinforcement materials' },
      { title: 'Pour concrete', description: 'Pour concrete foundation according to specifications' },
      { title: 'Allow curing time', description: 'Allow concrete to cure properly before proceeding' }
    ]
  },
  {
    title: 'Structural Elements',
    description: 'Build the main structural components',
    tasks: [
      { title: 'Erect columns and beams', description: 'Install main structural supports' },
      { title: 'Construct walls', description: 'Build load-bearing and partition walls' },
      { title: 'Install floor/ceiling supports', description: 'Place joists and other floor/ceiling supports' }
    ]
  },
  {
    title: 'Utilities Installation',
    description: 'Install major utility systems',
    tasks: [
      { title: 'Electrical rough-in', description: 'Install electrical wiring, panels, and boxes' },
      { title: 'Plumbing rough-in', description: 'Install water supply and drainage pipes' },
      { title: 'HVAC installation', description: 'Install heating, ventilation, and air conditioning systems' }
    ]
  }
];

/**
 * Common material templates that can be added to phases
 */
export const COMMON_MATERIAL_TEMPLATES = [
  {
    category: 'Concrete & Foundation',
    materials: [
      { name: 'Cement', quantity: '50', unit: 'bags' },
      { name: 'Sand', quantity: '5', unit: 'm³' },
      { name: 'Gravel', quantity: '10', unit: 'm³' },
      { name: 'Reinforcement steel', quantity: '500', unit: 'kg' },
      { name: 'Waterproofing membrane', quantity: '30', unit: 'm²' }
    ]
  },
  {
    category: 'Structural Materials',
    materials: [
      { name: 'Concrete blocks', quantity: '1000', unit: 'pcs' },
      { name: 'Structural timber', quantity: '50', unit: 'pcs' },
      { name: 'Steel beams', quantity: '10', unit: 'pcs' },
      { name: 'Roof trusses', quantity: '20', unit: 'pcs' },
      { name: 'Plywood sheets', quantity: '30', unit: 'pcs' }
    ]
  },
  {
    category: 'Finishing Materials',
    materials: [
      { name: 'Drywall sheets', quantity: '50', unit: 'pcs' },
      { name: 'Paint', quantity: '30', unit: 'l' },
      { name: 'Ceramic tiles', quantity: '100', unit: 'm²' },
      { name: 'Flooring material', quantity: '150', unit: 'm²' },
      { name: 'Insulation', quantity: '200', unit: 'm²' }
    ]
  },
  {
    category: 'Electrical & Plumbing',
    materials: [
      { name: 'Electrical wire', quantity: '300', unit: 'm' },
      { name: 'Electrical outlets', quantity: '30', unit: 'pcs' },
      { name: 'PVC pipes', quantity: '100', unit: 'm' },
      { name: 'Copper pipes', quantity: '50', unit: 'm' },
      { name: 'Light fixtures', quantity: '15', unit: 'pcs' }
    ]
  }
]; 