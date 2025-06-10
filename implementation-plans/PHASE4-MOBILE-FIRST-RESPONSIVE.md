# Phase 4: Mobile-First Responsive Design Implementation Plan

This document outlines specific changes needed to implement comprehensive mobile-first responsive design in the BuildEase application, ensuring optimal user experience on construction sites with mobile devices.

## 4.1 Create Responsive Utility Components

### Create Responsive Container Component:

```tsx
// src/components/ui/responsive-container.tsx
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface ResponsiveContainerProps {
  children: ReactNode
  className?: string
  fluid?: boolean
}

export function ResponsiveContainer({ 
  children, 
  className, 
  fluid = false 
}: ResponsiveContainerProps) {
  return (
    <div className={cn(
      'w-full px-4 mx-auto',
      // Mobile-first: Start with narrow constraints, then expand
      'sm:px-6',
      // Only constrain width on larger screens if not fluid
      !fluid && 'md:max-w-3xl lg:max-w-5xl xl:max-w-7xl',
      className
    )}>
      {children}
    </div>
  )
}
```

### Create Touch-Friendly Button Component:

```tsx
// src/components/ui/touch-button.tsx
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Button, ButtonProps } from '@/components/ui/button'

export interface TouchButtonProps extends ButtonProps {
  touchFriendly?: boolean
}

export const TouchButton = forwardRef<HTMLButtonElement, TouchButtonProps>(
  ({ className, touchFriendly = true, ...props }, ref) => {
    return (
      <Button
        className={cn(
          // Mobile-first: Ensure minimum 44px touch target on mobile
          touchFriendly && 'min-h-[44px] min-w-[44px]',
          // Add proper spacing for touch targets
          touchFriendly && 'my-1',
          // Full width on mobile, auto on larger screens
          'w-full sm:w-auto',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
TouchButton.displayName = 'TouchButton'
```

## 4.2 Create Mobile Navigation and Layout Components

### Create Collapsible Mobile Sidebar:

```tsx
// src/components/layout/MobileSidebar.tsx
import { useState } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import { SidebarContent } from './SidebarContent'

export function MobileSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden min-h-[44px] min-w-[44px]"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[80%] max-w-[300px] p-0">
        <SidebarContent isMobile={true} onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}
```

### Update AppLayout with Responsive Layout Components:

```tsx
// src/components/layout/AppLayout.tsx
import { Outlet } from 'react-router-dom'
import { RouteTransition } from '../RouteTransition'
import { PageMetadata } from './PageMetadata'
import { Sidebar } from './Sidebar'
import { MobileSidebar } from './MobileSidebar'
import { TopNav } from './TopNav'

export function AppLayout() {
  return (
    <div className="flex flex-col h-screen overflow-hidden md:flex-row">
      <PageMetadata />
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center h-16 px-4">
            {/* Mobile Sidebar - shown only on mobile */}
            <MobileSidebar />
            <TopNav />
          </div>
        </div>
        
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4">
          <RouteTransition>
            <Outlet />
          </RouteTransition>
        </main>
      </div>
    </div>
  )
}
```

## 4.3 Refactor Grid Layouts for Mobile-First Design

### Create Responsive Grid Component:

```tsx
// src/components/ui/responsive-grid.tsx
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface ResponsiveGridProps {
  children: ReactNode
  className?: string
  columns?: {
    mobile?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

export function ResponsiveGrid({ 
  children, 
  className,
  columns = { mobile: 1, sm: 2, md: 3, lg: 4, xl: 4 },
  gap = 'md' 
}: ResponsiveGridProps) {
  const gapClasses = {
    none: 'gap-0',
    xs: 'gap-1 sm:gap-2',
    sm: 'gap-2 sm:gap-3 md:gap-4',
    md: 'gap-3 sm:gap-4 md:gap-5 lg:gap-6',
    lg: 'gap-4 sm:gap-6 md:gap-8',
    xl: 'gap-6 sm:gap-8 md:gap-10'
  }
  
  // Calculate grid template columns classes
  // Starting mobile-first with the smallest screen size
  const { mobile, sm, md, lg, xl } = columns
  
  const gridCols = [
    mobile && `grid-cols-${mobile}`,
    sm && `sm:grid-cols-${sm}`,
    md && `md:grid-cols-${md}`,
    lg && `lg:grid-cols-${lg}`,
    xl && `xl:grid-cols-${xl}`
  ].filter(Boolean).join(' ')
  
  return (
    <div className={cn(
      'grid w-full',
      gridCols,
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  )
}
```

### Update ProjectsList with Mobile-First Design:

```tsx
// src/components/projects/ProjectsList.tsx (example of refactoring)
import { Project } from '@/types/project'
import { ResponsiveGrid } from '../ui/responsive-grid'
import { ProjectCard } from './ProjectCard'

interface ProjectsListProps {
  projects: Project[]
  isLoading?: boolean
}

export function ProjectsList({ projects, isLoading }: ProjectsListProps) {
  if (isLoading) {
    return (
      <ResponsiveGrid 
        columns={{ mobile: 1, sm: 2, md: 3, lg: 3 }}
        gap="md"
      >
        {Array(6).fill(0).map((_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </ResponsiveGrid>
    )
  }
  
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-lg text-gray-500 dark:text-gray-400">
          No projects found
        </p>
        {/* Add TouchButton for creating a project */}
      </div>
    )
  }
  
  return (
    <ResponsiveGrid 
      columns={{ mobile: 1, sm: 2, md: 3, lg: 3 }}
      gap="md"
    >
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </ResponsiveGrid>
  )
}
```

## 4.4 Add Mobile Gesture Support

### Create Swipe Gesture Hook:

```tsx
// src/hooks/use-swipe.ts
import { useState, useEffect, TouchEvent, MouseEvent } from 'react'

interface SwipeHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
}

interface SwipeOptions {
  threshold?: number
  preventDefault?: boolean
}

const defaultOptions: SwipeOptions = {
  threshold: 50,
  preventDefault: true
}

export function useSwipe(
  handlers: SwipeHandlers, 
  options: SwipeOptions = {}
) {
  const { threshold, preventDefault } = { ...defaultOptions, ...options }
  
  const [touchStart, setTouchStart] = useState<{x: number, y: number} | null>(null)
  const [touchEnd, setTouchEnd] = useState<{x: number, y: number} | null>(null)
  
  // Reset
  const resetTouch = () => {
    setTouchStart(null)
    setTouchEnd(null)
  }
  
  // Handle touch start
  const handleTouchStart = (e: TouchEvent | MouseEvent) => {
    if (preventDefault) e.preventDefault()
    
    const touchEvent = 'touches' in e ? e.touches[0] : e
    setTouchStart({ x: touchEvent.clientX, y: touchEvent.clientY })
  }
  
  // Handle touch move
  const handleTouchMove = (e: TouchEvent | MouseEvent) => {
    if (preventDefault) e.preventDefault()
    
    const touchEvent = 'touches' in e ? e.touches[0] : e
    setTouchEnd({ x: touchEvent.clientX, y: touchEvent.clientY })
  }
  
  // Handle touch end
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distanceX = touchStart.x - touchEnd.x
    const distanceY = touchStart.y - touchEnd.y
    
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY)
    
    if (isHorizontalSwipe) {
      if (distanceX > threshold && handlers.onSwipeLeft) {
        handlers.onSwipeLeft()
      } else if (distanceX < -threshold && handlers.onSwipeRight) {
        handlers.onSwipeRight()
      }
    } else {
      if (distanceY > threshold && handlers.onSwipeUp) {
        handlers.onSwipeUp()
      } else if (distanceY < -threshold && handlers.onSwipeDown) {
        handlers.onSwipeDown()
      }
    }
    
    resetTouch()
  }
  
  useEffect(() => {
    return () => {
      resetTouch()
    }
  }, [])
  
  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  }
}
```

### Implement Swipe Navigation for Project Phases:

```tsx
// src/components/phases/PhaseNavigation.tsx
import { useSwipe } from '@/hooks/use-swipe'
import { useNavigate } from 'react-router-dom'
import { TouchButton } from '../ui/touch-button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PhaseNavigationProps {
  phases: { id: string; name: string }[]
  currentPhaseId: string
}

export function PhaseNavigation({ phases, currentPhaseId }: PhaseNavigationProps) {
  const navigate = useNavigate()
  
  // Find current phase index
  const currentIndex = phases.findIndex(phase => phase.id === currentPhaseId)
  
  // Determine if navigation is possible
  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex < phases.length - 1
  
  // Navigation functions
  const goToPrevious = () => {
    if (hasPrevious) {
      navigate(`/phase/${phases[currentIndex - 1].id}`)
    }
  }
  
  const goToNext = () => {
    if (hasNext) {
      navigate(`/phase/${phases[currentIndex + 1].id}`)
    }
  }
  
  // Set up swipe handlers
  const swipeHandlers = useSwipe({
    onSwipeLeft: hasNext ? goToNext : undefined,
    onSwipeRight: hasPrevious ? goToPrevious : undefined
  })
  
  return (
    <div 
      className="w-full touch-manipulation"
      onTouchStart={swipeHandlers.handleTouchStart}
      onTouchMove={swipeHandlers.handleTouchMove}
      onTouchEnd={swipeHandlers.handleTouchEnd}
    >
      <div className="flex items-center justify-between mb-4">
        <TouchButton
          variant="ghost"
          size="sm"
          onClick={goToPrevious}
          disabled={!hasPrevious}
          className="flex items-center"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          {hasPrevious ? phases[currentIndex - 1].name : 'Previous'}
        </TouchButton>
        
        <span className="text-sm text-gray-500">
          {currentIndex + 1} of {phases.length}
        </span>
        
        <TouchButton
          variant="ghost"
          size="sm"
          onClick={goToNext}
          disabled={!hasNext}
          className="flex items-center"
        >
          {hasNext ? phases[currentIndex + 1].name : 'Next'}
          <ChevronRight className="ml-1 h-4 w-4" />
        </TouchButton>
      </div>
      
      {/* Mobile swipe indicator - only visible on touch devices */}
      <div className="md:hidden text-xs text-center text-gray-400 mt-1">
        Swipe to navigate between phases
      </div>
    </div>
  )
}
```

## 4.5 Add Responsive Typography and Spacing

### Create Responsive Typography Utilities:

```css
/* src/styles/responsive-typography.css */
:root {
  --font-size-base: 16px;
  --line-height-base: 1.5;
  
  /* Mobile-first responsive typography scale */
  --h1-size: 1.75rem;    /* 28px */
  --h2-size: 1.5rem;     /* 24px */
  --h3-size: 1.25rem;    /* 20px */
  --h4-size: 1.125rem;   /* 18px */
  --text-xl: 1.125rem;   /* 18px */
  --text-lg: 1rem;       /* 16px */
  --text-base: 0.9375rem; /* 15px */
  --text-sm: 0.875rem;   /* 14px */
  --text-xs: 0.75rem;    /* 12px */
  
  /* Section spacing */
  --section-spacing: 1.5rem;  /* 24px */
  --card-padding: 1rem;       /* 16px */
}

@media (min-width: 640px) {
  :root {
    --h1-size: 2rem;      /* 32px */
    --h2-size: 1.75rem;   /* 28px */
    --h3-size: 1.5rem;    /* 24px */
    --h4-size: 1.25rem;   /* 20px */
    --text-xl: 1.25rem;   /* 20px */
    --text-lg: 1.125rem;  /* 18px */
    --text-base: 1rem;    /* 16px */
    --section-spacing: 2rem;    /* 32px */
    --card-padding: 1.25rem;    /* 20px */
  }
}

@media (min-width: 1024px) {
  :root {
    --h1-size: 2.25rem;   /* 36px */
    --h2-size: 1.875rem;  /* 30px */
    --h3-size: 1.5rem;    /* 24px */
    --section-spacing: 2.5rem;  /* 40px */
    --card-padding: 1.5rem;     /* 24px */
  }
}

/* Apply to elements */
h1, .h1 { font-size: var(--h1-size); }
h2, .h2 { font-size: var(--h2-size); }
h3, .h3 { font-size: var(--h3-size); }
h4, .h4 { font-size: var(--h4-size); }
.text-xl { font-size: var(--text-xl); }
.text-lg { font-size: var(--text-lg); }
.text-base { font-size: var(--text-base); }
.text-sm { font-size: var(--text-sm); }
.text-xs { font-size: var(--text-xs); }

.section-spacing { margin-bottom: var(--section-spacing); }
.card-padding { padding: var(--card-padding); }
```

### Create Responsive Heading Component:

```tsx
// src/components/ui/responsive-heading.tsx
import { forwardRef, ElementRef, ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/utils'
import { VariantProps, cva } from 'class-variance-authority'

export const headingVariants = cva(
  "font-semibold tracking-tight",
  {
    variants: {
      size: {
        h1: "text-2xl sm:text-3xl lg:text-4xl", // Mobile-first approach
        h2: "text-xl sm:text-2xl lg:text-3xl",
        h3: "text-lg sm:text-xl lg:text-2xl",
        h4: "text-base sm:text-lg",
      },
      align: {
        left: "text-left",
        center: "text-center",
        right: "text-right",
      },
      responsive: {
        true: "", // Default responsive behavior
        false: "", // Non-responsive option
      },
    },
    defaultVariants: {
      size: "h1",
      align: "left",
      responsive: true,
    },
  }
)

interface HeadingProps extends ComponentPropsWithoutRef<"h1">, 
  VariantProps<typeof headingVariants> {
  as?: 'h1' | 'h2' | 'h3' | 'h4'
}

export const Heading = forwardRef<ElementRef<"h1">, HeadingProps>(
  ({ className, children, size, align, responsive, as = 'h1', ...props }, ref) => {
    const Component = as
    
    return (
      <Component
        className={cn(headingVariants({ size, align, responsive, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </Component>
    )
  }
)
Heading.displayName = 'Heading'
```

## 4.6 Create Responsive Card Components

### Create Adaptive Card Layouts:

```tsx
// src/components/ui/responsive-card.tsx
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface ResponsiveCardProps {
  children: ReactNode
  className?: string
  fullWidth?: boolean
  stackOnMobile?: boolean
}

export function ResponsiveCard({ 
  children, 
  className,
  fullWidth = false,
  stackOnMobile = true
}: ResponsiveCardProps) {
  return (
    <div className={cn(
      'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden',
      'shadow-sm hover:shadow transition-shadow duration-200',
      // Mobile-first: Apply different padding based on screen size
      'p-4 sm:p-5 lg:p-6',
      // Width control
      fullWidth ? 'w-full' : 'w-full sm:max-w-md md:max-w-lg lg:max-w-xl',
      className
    )}>
      {children}
    </div>
  )
}

interface ResponsiveCardContentProps {
  children: ReactNode
  className?: string
  stackOnMobile?: boolean
}

export function ResponsiveCardContent({ 
  children, 
  className,
  stackOnMobile = true
}: ResponsiveCardContentProps) {
  return (
    <div className={cn(
      // Mobile-first: Stack on mobile, use flex layout on larger screens if needed
      stackOnMobile ? 'flex flex-col sm:flex-row' : 'flex flex-row',
      'gap-4 sm:gap-6',
      className
    )}>
      {children}
    </div>
  )
}
```

## 4.7 Optimize Images for Responsive Loading

### Create Responsive Image Component:

```tsx
// src/components/ui/responsive-image.tsx
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface ResponsiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  mobileSrc?: string
  tabletSrc?: string
  desktopSrc?: string
  fallbackSrc?: string
  alt: string
  className?: string
  imgClassName?: string
}

export function ResponsiveImage({
  mobileSrc,
  tabletSrc,
  desktopSrc,
  fallbackSrc,
  src,
  alt,
  className,
  imgClassName,
  ...props
}: ResponsiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(false)
  
  // Use the most specific source available
  const targetSrc = error && fallbackSrc ? fallbackSrc : src
  
  return (
    <div className={cn(
      'relative overflow-hidden',
      !isLoaded && 'bg-gray-200 dark:bg-gray-700 animate-pulse',
      className
    )}>
      {/* Show image only when loaded */}
      <img
        src={targetSrc}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          imgClassName
        )}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setError(true)
          if (fallbackSrc && !error) {
            // If we have a fallback and this is the first error
            setIsLoaded(false)
          } else {
            // No fallback or already tried fallback
            setIsLoaded(true)
          }
        }}
        {...props}
        srcSet={mobileSrc && tabletSrc && desktopSrc ? [
          `${mobileSrc} 480w`,
          `${tabletSrc} 768w`,
          `${desktopSrc} 1280w`
        ].join(', ') : undefined}
        sizes={mobileSrc && tabletSrc && desktopSrc ? 
          '(max-width: 480px) 480px, (max-width: 768px) 768px, 1280px' : 
          undefined}
      />
    </div>
  )
}
```

## 4.8 Mobile-First Forms Implementation

### Create Mobile-First Form Layout:

```tsx
// src/components/ui/mobile-form-layout.tsx
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface MobileFormLayoutProps {
  children: ReactNode
  className?: string
  fullWidth?: boolean
}

export function MobileFormLayout({ 
  children, 
  className,
  fullWidth = false 
}: MobileFormLayoutProps) {
  return (
    <div className={cn(
      'space-y-6', 
      fullWidth ? 'w-full' : 'w-full sm:max-w-md md:max-w-lg',
      className
    )}>
      {children}
    </div>
  )
}

interface MobileFormGroupProps {
  children: ReactNode
  className?: string
}

export function MobileFormGroup({ children, className }: MobileFormGroupProps) {
  return (
    <div className={cn(
      // Stack vertically on mobile, allow horizontal on larger screens when appropriate
      'space-y-4 sm:space-y-5',
      className
    )}>
      {children}
    </div>
  )
}

interface MobileFormFieldProps {
  children: ReactNode
  className?: string
  horizontal?: boolean
}

export function MobileFormField({ 
  children, 
  className,
  horizontal = false 
}: MobileFormFieldProps) {
  return (
    <div className={cn(
      // Mobile-first: Stack fields vertically by default on mobile
      horizontal ? 
        'flex flex-col sm:flex-row sm:items-center sm:gap-4' : 
        'flex flex-col',
      'gap-2',
      className
    )}>
      {children}
    </div>
  )
}

interface MobileFormActionsProps {
  children: ReactNode
  className?: string
  align?: 'left' | 'center' | 'right' | 'stretch'
}

export function MobileFormActions({ 
  children, 
  className,
  align = 'stretch' 
}: MobileFormActionsProps) {
  return (
    <div className={cn(
      // Mobile-first: Stack actions vertically on mobile, horizontal on larger screens
      'flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8',
      // Alignment options (different on mobile vs desktop)
      align === 'left' && 'sm:justify-start',
      align === 'center' && 'sm:justify-center',
      align === 'right' && 'sm:justify-end',
      align === 'stretch' && 'sm:justify-stretch',
      // On mobile, stretch all buttons by default
      '[&>button]:w-full sm:[&>button]:w-auto',
      className
    )}>
      {children}
    </div>
  )
}
```

These implementations provide comprehensive mobile-first responsive design patterns for the BuildEase application, ensuring an optimal experience for users accessing the platform on construction sites via mobile devices.
