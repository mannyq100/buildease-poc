# Mobile-First Styling Guide

Guide for implementing mobile-first responsive design in BuildEase using TailwindCSS.

## Instructions

You are styling components for the BuildEase construction management platform with a mobile-first approach. Follow these guidelines:

### Core Mobile-First Principles

1. **Start with mobile** - Design for smallest screen first
2. **Progressive enhancement** - Add features for larger screens
3. **Touch-friendly sizing** - Minimum 44px touch targets
4. **Responsive breakpoints** - Use Tailwind's responsive prefixes properly

### Tailwind Breakpoints
```css
/* Mobile First Approach */
.component {
  /* Mobile base styles (default) */
  
  @media (min-width: 640px) { /* sm: */ }
  @media (min-width: 768px) { /* md: */ }
  @media (min-width: 1024px) { /* lg: */ }
  @media (min-width: 1280px) { /* xl: */ }
  @media (min-width: 1536px) { /* 2xl: */ }
}
```

### BuildEase Design System

#### Colors
```typescript
// Primary palette
const colors = {
  primary: {
    50: '#eff6ff',
    500: '#2B6CB0', // Main blue
    600: '#1d4ed8',
    900: '#1e3a8a',
  },
  secondary: {
    50: '#f7fafc',
    500: '#718096', // Muted earth tones
    600: '#4a5568',
  },
  accent: {
    500: '#ED8936', // Warm orange
    600: '#dd6b20',
  },
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
};
```

#### Typography Scale
```css
/* Mobile-first typography */
.text-scale {
  font-size: 16px;    /* Base mobile size */
  line-height: 1.5;   /* Readable line height */
}

@media (min-width: 768px) {
  .text-scale {
    font-size: 18px;  /* Scale up for tablets */
  }
}
```

### Mobile-First Component Examples

#### 1. Card Layout
```typescript
// Mobile: Stacked, Desktop: Grid
<div className="
  flex flex-col gap-4           /* Mobile: stack vertically */
  p-4                          /* Mobile: standard padding */
  sm:p-6                       /* Small+: increased padding */
  md:flex-row md:gap-6         /* Medium+: horizontal layout */
  lg:gap-8 lg:p-8              /* Large+: more space */
">
  <div className="
    w-full                     /* Mobile: full width */
    md:w-1/3                   /* Medium+: 1/3 width */
  ">
    {/* Content */}
  </div>
</div>
```

#### 2. Navigation
```typescript
// Mobile: Hamburger, Desktop: Horizontal
<nav className="
  flex flex-col                /* Mobile: vertical */
  fixed inset-x-0 top-0        /* Mobile: full-width overlay */
  bg-white shadow-lg           /* Mobile: prominent shadow */
  
  sm:flex-row                  /* Small+: horizontal */
  sm:relative sm:shadow-none   /* Small+: inline layout */
  sm:bg-transparent            /* Small+: transparent bg */
">
  <div className="
    p-4                        /* Mobile: touch-friendly padding */
    border-b border-gray-200   /* Mobile: visual separation */
    
    sm:p-2 sm:border-0         /* Small+: compact, no border */
  ">
    {/* Navigation items */}
  </div>
</nav>
```

#### 3. Buttons
```typescript
// Touch-friendly mobile buttons
<button className="
  h-12 w-full                  /* Mobile: full width, touch height */
  px-6 py-3                    /* Mobile: generous padding */
  text-base font-medium        /* Mobile: readable text */
  bg-orange-600 text-white     /* BuildEase accent color */
  rounded-lg                   /* Mobile: friendly corners */
  touch-manipulation           /* Optimize for touch */
  
  sm:w-auto sm:h-10           /* Small+: auto width, compact */
  sm:px-4 sm:py-2             /* Small+: reduced padding */
  sm:text-sm                  /* Small+: smaller text */
  
  hover:bg-orange-700         /* Desktop: hover state */
  focus:ring-2 focus:ring-orange-500 /* Accessibility */
  disabled:opacity-50         /* Disabled state */
">
  Action Button
</button>
```

#### 4. Form Inputs
```typescript
// Mobile-optimized form fields
<input className="
  h-12 w-full                  /* Mobile: touch-friendly height */
  px-4 py-3                    /* Mobile: comfortable padding */
  text-base                    /* Mobile: readable text size */
  border border-gray-300       /* Clear visual boundary */
  rounded-lg                   /* Friendly appearance */
  
  sm:h-10 sm:py-2             /* Small+: more compact */
  sm:text-sm                  /* Small+: smaller text */
  
  focus:ring-2 focus:ring-blue-500  /* Focus state */
  focus:border-blue-500            /* Focus border */
  disabled:bg-gray-100             /* Disabled state */
" />
```

#### 5. Data Tables
```typescript
// Mobile: Cards, Desktop: Table
<div className="
  space-y-4                    /* Mobile: stacked cards */
  
  lg:space-y-0                 /* Large+: no spacing */
">
  {/* Mobile Card View */}
  <div className="
    block                      /* Mobile: show cards */
    p-4 bg-white rounded-lg    /* Mobile: card styling */
    border border-gray-200     /* Mobile: clear boundaries */
    
    lg:hidden                  /* Large+: hide cards */
  ">
    {/* Card content */}
  </div>
  
  {/* Desktop Table View */}
  <table className="
    hidden                     /* Mobile: hide table */
    w-full                     /* Desktop: full width */
    
    lg:table                   /* Large+: show table */
  ">
    {/* Table content */}
  </table>
</div>
```

#### 6. Grid Layouts
```typescript
// Responsive grid system
<div className="
  grid grid-cols-1 gap-4       /* Mobile: single column */
  
  sm:grid-cols-2 sm:gap-6      /* Small+: 2 columns */
  md:grid-cols-3               /* Medium+: 3 columns */
  lg:grid-cols-4 lg:gap-8      /* Large+: 4 columns */
  xl:grid-cols-5               /* Extra large: 5 columns */
">
  {items.map(item => (
    <div key={item.id} className="
      min-h-[200px]             /* Consistent minimum height */
      p-4                       /* Internal spacing */
      bg-white rounded-lg       /* Card appearance */
      shadow-sm                 /* Subtle shadow */
      
      hover:shadow-md           /* Desktop: enhanced shadow */
      transition-shadow         /* Smooth transition */
    ">
      {/* Item content */}
    </div>
  ))}
</div>
```

### Construction Industry Specific Patterns

#### 1. Status Indicators
```typescript
// Construction project status
<div className="
  flex items-center gap-2      /* Horizontal layout */
  px-3 py-2                    /* Touch-friendly padding */
  rounded-full                 /* Pill shape */
  text-sm font-medium          /* Clear typography */
  
  /* Status-specific colors */
  bg-green-100 text-green-800  /* Completed */
  bg-amber-100 text-amber-800  /* In Progress */
  bg-red-100 text-red-800      /* Issue */
  bg-gray-100 text-gray-800    /* Pending */
">
  <div className="w-2 h-2 bg-current rounded-full" />
  Status Text
</div>
```

#### 2. Progress Bars
```typescript
// Construction phase progress
<div className="w-full">
  <div className="
    flex justify-between items-center
    mb-2                       /* Space above bar */
    text-sm text-gray-600      /* Label styling */
  ">
    <span>Phase Progress</span>
    <span>75%</span>
  </div>
  <div className="
    w-full h-3                 /* Bar dimensions */
    bg-gray-200 rounded-full   /* Background track */
    overflow-hidden            /* Clean edges */
  ">
    <div 
      className="
        h-full bg-blue-600     /* Progress color */
        transition-all duration-300  /* Smooth animation */
      "
      style={{ width: '75%' }}
    />
  </div>
</div>
```

#### 3. Action Menus
```typescript
// Mobile-optimized action menu
<div className="
  flex flex-col gap-2          /* Mobile: stacked actions */
  p-4                          /* Mobile: generous padding */
  
  sm:flex-row sm:gap-4         /* Small+: horizontal layout */
  sm:p-2                       /* Small+: compact padding */
">
  <button className="
    h-12 px-4                  /* Touch-friendly size */
    bg-white border border-gray-300
    rounded-lg                 /* Friendly corners */
    text-sm font-medium        /* Clear text */
    
    hover:bg-gray-50           /* Desktop hover */
    active:bg-gray-100         /* Touch feedback */
  ">
    Edit
  </button>
</div>
```

### Performance Considerations

#### 1. Image Optimization
```typescript
// Responsive images
<img 
  className="
    w-full h-48 object-cover   /* Mobile: full width, fixed height */
    rounded-lg                 /* Consistent styling */
    
    sm:h-32                    /* Small+: shorter height */
    md:w-1/2                   /* Medium+: half width */
  "
  src={`${imageUrl}?w=640`}    /* Mobile-optimized size */
  srcSet={`
    ${imageUrl}?w=640 640w,    /* Mobile */
    ${imageUrl}?w=1024 1024w,  /* Tablet */
    ${imageUrl}?w=1280 1280w   /* Desktop */
  `}
  sizes="
    (max-width: 640px) 100vw,  /* Mobile: full viewport */
    (max-width: 1024px) 50vw,  /* Tablet: half viewport */
    25vw                       /* Desktop: quarter viewport */
  "
  loading="lazy"               /* Performance optimization */
  alt="Descriptive text"
/>
```

### Testing Checklist

#### Mobile Testing
- [ ] Test on actual mobile devices
- [ ] Check touch target sizes (minimum 44px)
- [ ] Verify text readability without zoom
- [ ] Test landscape and portrait orientations
- [ ] Check thumb reachability for key actions

#### Responsive Testing
- [ ] Test all major breakpoints
- [ ] Verify smooth transitions between sizes
- [ ] Check content doesn't overflow
- [ ] Ensure images scale properly
- [ ] Test navigation at all sizes

### Common Patterns

#### Quick Reference
```typescript
// Container widths
"w-full sm:w-auto"           // Full mobile, auto desktop
"max-w-sm sm:max-w-none"     // Constrained mobile, free desktop

// Spacing
"p-4 sm:p-6 lg:p-8"          // Progressive padding
"gap-4 sm:gap-6 lg:gap-8"    // Progressive gap

// Text sizing
"text-base sm:text-lg lg:text-xl"  // Progressive text scale

// Grid columns
"grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"  // Progressive columns

// Flexbox direction
"flex-col sm:flex-row"       // Stack mobile, row desktop

// Show/hide elements
"block sm:hidden"            // Show mobile only
"hidden sm:block"            // Show desktop only
```

### Remember
- Always start with mobile styles (no prefix)
- Test on real devices, not just browser dev tools
- Use touch-friendly sizing (44px minimum)
- Consider construction site conditions (bright sun, gloves)
- Optimize for one-handed use on mobile
- Ensure critical actions are thumb-reachable
- Use progressive enhancement, not graceful degradation