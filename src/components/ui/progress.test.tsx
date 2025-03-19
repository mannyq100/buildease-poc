import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Progress } from './progress'

describe('Progress Component', () => {
  it('should render correctly', () => {
    const { container, debug } = render(<Progress value={50} />)
    
    // Debug the component structure
    console.log(container.innerHTML)
    
    // Root component should have the base classes
    const root = container.firstChild
    expect(root).toHaveClass('relative h-4 w-full overflow-hidden rounded-full bg-secondary')
    
    // Find the indicator
    const indicator = root?.firstChild
    expect(indicator).not.toBeNull()
    
    if (indicator) {
      expect(indicator).toHaveClass('h-full w-full flex-1 bg-primary transition-all')
      expect(indicator.getAttribute('style')).toContain('translateX(-50%)')
    }
  })
  
  it('should accept and apply className to root element', () => {
    const { container } = render(<Progress value={50} className="custom-class" />)
    
    const root = container.firstChild
    expect(root).toHaveClass('custom-class')
    expect(root).toHaveClass('relative h-4 w-full overflow-hidden rounded-full bg-secondary')
  })
  
  it('should accept and apply indicatorClassName to indicator element', () => {
    const { container } = render(
      <Progress value={50} indicatorClassName="bg-green-500" />
    )
    
    const root = container.firstChild
    const indicator = root?.firstChild
    
    if (indicator) {
      expect(indicator).toHaveClass('bg-green-500')
      expect(indicator).toHaveClass('h-full')
      expect(indicator).toHaveClass('w-full')
      expect(indicator).toHaveClass('flex-1')
      expect(indicator).toHaveClass('transition-all')
    }
  })
  
  it('should handle different values correctly', () => {
    const { container: container25 } = render(<Progress value={25} />)
    const indicator25 = container25.firstChild?.firstChild
    expect(indicator25?.getAttribute('style')).toContain('translateX(-75%)')
    
    const { container: container75 } = render(<Progress value={75} />)
    const indicator75 = container75.firstChild?.firstChild
    expect(indicator75?.getAttribute('style')).toContain('translateX(-25%)')
    
    const { container: container100 } = render(<Progress value={100} />)
    const indicator100 = container100.firstChild?.firstChild
    expect(indicator100?.getAttribute('style')).toContain('translateX(-0%)')
  })
  
  it('should handle undefined value', () => {
    const { container } = render(<Progress value={undefined} />)
    
    const indicator = container.firstChild?.firstChild
    expect(indicator?.getAttribute('style')).toContain('translateX(-100%)')
  })
}) 