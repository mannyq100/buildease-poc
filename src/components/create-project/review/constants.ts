/**
 * Constants for the ReviewSubmitForm component
 * Extracted to reduce main component size and improve maintainability
 */

export const STRUCTURE_TYPES = [
  { value: 'ai-recommend', label: 'Let AI recommend' },
  { value: 'concrete-frame', label: 'Concrete Frame' },
  { value: 'steel-frame', label: 'Steel Frame' },
  { value: 'masonry', label: 'Masonry' },
  { value: 'wood-frame', label: 'Wood Frame' },
  { value: 'hybrid', label: 'Hybrid Construction' }
];

export const FOUNDATION_TYPES = [
  { value: 'ai-recommend', label: 'Let AI recommend' },
  { value: 'strip-foundation', label: 'Strip Foundation' },
  { value: 'pad-foundation', label: 'Pad Foundation' },
  { value: 'raft-foundation', label: 'Raft Foundation' },
  { value: 'pile-foundation', label: 'Pile Foundation' }
];

export const ROOF_TYPES = [
  { value: 'ai-recommend', label: 'Let AI recommend' },
  { value: 'gable', label: 'Gable Roof' },
  { value: 'hip', label: 'Hip Roof' },
  { value: 'flat', label: 'Flat Roof' },
  { value: 'shed', label: 'Shed Roof' },
  { value: 'mansard', label: 'Mansard Roof' }
];

export const WALL_MATERIALS = [
  { value: 'ai-recommend', label: 'Let AI recommend' },
  { value: 'concrete-blocks', label: 'Concrete Blocks' },
  { value: 'clay-bricks', label: 'Clay Bricks' },
  { value: 'sandcrete-blocks', label: 'Sandcrete Blocks' },
  { value: 'stone', label: 'Natural Stone' },
  { value: 'compressed-earth', label: 'Compressed Earth Blocks' }
];

export const FLOOR_MATERIALS = [
  { value: 'ai-recommend', label: 'Let AI recommend' },
  { value: 'ceramic-tiles', label: 'Ceramic Tiles' },
  { value: 'porcelain-tiles', label: 'Porcelain Tiles' },
  { value: 'concrete-screed', label: 'Concrete Screed' },
  { value: 'terrazzo', label: 'Terrazzo' },
  { value: 'natural-stone', label: 'Natural Stone' },
  { value: 'hardwood', label: 'Hardwood' }
];

export const SPECIAL_FEATURES = [
  'swimming-pool', 'garage', 'basement', 'attic', 'balcony', 'patio', 
  'garden', 'security-system', 'cctv', 'generator-room', 'water-tank',
  'solar-panels', 'backup-power', 'home-office', 'gym', 'library',
  'entertainment-room', 'guest-house', 'servants-quarters', 'laundry-room'
];

export const SUSTAINABILITY_FEATURES = [
  'solar-panels', 'rainwater-harvesting', 'energy-efficient-lighting',
  'double-glazed-windows', 'insulation', 'natural-ventilation',
  'green-roof', 'recycled-materials', 'low-flow-fixtures',
  'smart-home-systems', 'waste-management', 'native-landscaping'
];