/**
 * Mock data for project input form options
 * Contains all selection options used in the project input form
 */

/**
 * Ghana regions options
 */
export const REGIONS = [
  { value: "greater-accra", label: "Greater Accra" },
  { value: "ashanti", label: "Ashanti" },
  { value: "eastern", label: "Eastern" },
  { value: "western", label: "Western" },
  { value: "central", label: "Central" },
  { value: "volta", label: "Volta" },
  { value: "northern", label: "Northern" },
  { value: "upper-east", label: "Upper East" },
  { value: "upper-west", label: "Upper West" },
  { value: "bono", label: "Bono" },
  { value: "bono-east", label: "Bono East" },
  { value: "ahafo", label: "Ahafo" },
  { value: "savannah", label: "Savannah" },
  { value: "north-east", label: "North East" },
  { value: "oti", label: "Oti" },
  { value: "western-north", label: "Western North" }
];

/**
 * Project type options
 */
export const PROJECT_TYPES = [
  { value: "residential-single", label: "Residential (Single Family)" },
  { value: "residential-multi", label: "Residential (Multi-Family)" },
  { value: "commercial-small", label: "Commercial (Small)" },
  { value: "commercial-large", label: "Commercial (Large)" },
  { value: "mixed-use", label: "Mixed-Use Building" },
  { value: "renovation", label: "Renovation Project" },
  { value: "community", label: "Community Building" },
  { value: "religious", label: "Religious Building" },
  { value: "educational", label: "Educational Facility" }
];

/**
 * Roof type options
 */
export const ROOF_TYPES = [
  { value: "gable", label: "Gable Roof" },
  { value: "hip", label: "Hip Roof" },
  { value: "flat", label: "Flat Roof" },
  { value: "shed", label: "Shed Roof" },
  { value: "metal-sheet", label: "Metal Sheet Roof" },
  { value: "aluminum", label: "Aluminum Roof" },
  { value: "clay-tiles", label: "Clay Tiles" },
  { value: "concrete-tiles", label: "Concrete Tiles" },
  { value: "thatch", label: "Traditional Thatch" }
];

/**
 * Foundation type options
 */
export const FOUNDATION_TYPES = [
  { value: "strip", label: "Strip Foundation" },
  { value: "raft", label: "Raft Foundation" },
  { value: "pad", label: "Pad Foundation" },
  { value: "pile", label: "Pile Foundation" },
  { value: "raised-pile", label: "Raised Pile Foundation" }
];

/**
 * Building structure options
 */
export const BUILDING_STRUCTURES = [
  { value: "concrete-frame", label: "Concrete Frame" },
  { value: "load-bearing", label: "Load-Bearing Walls" },
  { value: "steel-frame", label: "Steel Frame" },
  { value: "timber-frame", label: "Timber Frame" },
  { value: "hybrid", label: "Hybrid Structure" }
];

/**
 * Wall material options
 */
export const WALL_MATERIALS = [
  { value: "concrete-blocks", label: "Concrete Blocks" },
  { value: "clay-bricks", label: "Clay Bricks" },
  { value: "compressed-earth", label: "Compressed Earth Blocks" },
  { value: "stone", label: "Stone" },
  { value: "wood", label: "Wood" },
  { value: "glass", label: "Glass" }
];

/**
 * Floor material options
 */
export const FLOOR_MATERIALS = [
  { value: "concrete", label: "Concrete" },
  { value: "ceramic-tiles", label: "Ceramic Tiles" },
  { value: "porcelain-tiles", label: "Porcelain Tiles" },
  { value: "terrazzo", label: "Terrazzo" },
  { value: "wood", label: "Wood" },
  { value: "vinyl", label: "Vinyl" },
  { value: "stone", label: "Stone" }
];

/**
 * Ceiling material options
 */
export const CEILING_MATERIALS = [
  { value: "plasterboard", label: "Plasterboard (Gypsum)" },
  { value: "wood", label: "Wood" },
  { value: "pvc", label: "PVC Panels" },
  { value: "fibre-cement", label: "Fibre Cement Boards" },
  { value: "acoustic-tiles", label: "Acoustic Tiles" }
];

/**
 * Modern amenities options
 */
export const MODERN_AMENITIES = [
  { value: "smart-home", label: "Smart Home Systems", icon: "Settings" },
  { value: "solar-panels", label: "Solar Panels", icon: "Sun" },
  { value: "water-harvesting", label: "Rainwater Harvesting", icon: "Droplet" },
  { value: "central-ac", label: "Central Air Conditioning", icon: "Wind" },
  { value: "backup-generator", label: "Backup Generator", icon: "Zap" },
  { value: "water-heater", label: "Solar Water Heater", icon: "Thermometer" },
  { value: "security-system", label: "Security System", icon: "Shield" },
  { value: "internet", label: "High-Speed Internet Wiring", icon: "Wifi" },
  { value: "elevator", label: "Elevator", icon: "ArrowUp" }
];

/**
 * Special features options
 */
export const SPECIAL_FEATURES = [
  { value: "pool", label: "Swimming Pool", icon: "Waves" },
  { value: "garden", label: "Garden", icon: "Trees" },
  { value: "gym", label: "Home Gym", icon: "Dumbbell" },
  { value: "outdoor-kitchen", label: "Outdoor Kitchen", icon: "Utensils" },
  { value: "entertainment", label: "Entertainment Room", icon: "Music" },
  { value: "study", label: "Study/Library", icon: "BookOpen" },
  { value: "guest-house", label: "Guest House", icon: "Users" },
  { value: "balcony", label: "Balcony", icon: "View" },
  { value: "rooftop", label: "Rooftop Terrace", icon: "Mountain" }
];

/**
 * Window type options
 */
export const WINDOW_TYPES = [
  { value: "casement", label: "Casement Windows" },
  { value: "sliding", label: "Sliding Windows" },
  { value: "fixed", label: "Fixed Windows" },
  { value: "awning", label: "Awning Windows" },
  { value: "louvre", label: "Louvre Windows" },
  { value: "french", label: "French Windows" }
];

/**
 * Currency options
 */
export const CURRENCIES = [
  { value: "cedi", label: "Ghana Cedi (GHS)", symbol: "₵" },
  { value: "usd", label: "US Dollar (USD)", symbol: "$" },
  { value: "euro", label: "Euro (EUR)", symbol: "€" },
  { value: "gbp", label: "British Pound (GBP)", symbol: "£" }
];

/**
 * Size unit options
 */
export const SIZE_UNITS = [
  { value: "sqm", label: "Square Meters (m²)" },
  { value: "sqft", label: "Square Feet (ft²)" },
  { value: "acres", label: "Acres" },
  { value: "hectares", label: "Hectares" }
];

/**
 * Language options
 */
export const LANGUAGES = [
  { value: "english", label: "English" },
  { value: "french", label: "French" },
  { value: "twi", label: "Twi" },
  { value: "ga", label: "Ga" },
  { value: "ewe", label: "Ewe" },
  { value: "dagbani", label: "Dagbani" }
];

/**
 * Building style options
 */
export const BUILDING_STYLES = [
  { value: "modern", label: "Modern" },
  { value: "traditional", label: "Traditional Ghanaian" },
  { value: "colonial", label: "Colonial" },
  { value: "contemporary", label: "Contemporary" },
  { value: "minimalist", label: "Minimalist" },
  { value: "tropical", label: "Tropical" },
  { value: "mediterranean", label: "Mediterranean" },
  { value: "african-fusion", label: "African Fusion" }
]; 