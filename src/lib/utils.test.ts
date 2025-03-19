import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cn, debounce, memoize } from './utils'

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
      expect(cn('class1', null, 'class2')).toBe('class1 class2')
      expect(cn('class1', undefined, 'class2')).toBe('class1 class2')
      const condition1 = '';
      const condition2 = 'value';
      expect(cn('class1', condition1 && 'class2', Boolean(condition2) && 'class3')).toBe('class1 class3')
    })

    it('should handle Tailwind conflicts correctly', () => {
      expect(cn('px-4 py-2', 'px-6')).toBe('py-2 px-6')
      expect(cn('text-sm text-gray-500', 'text-lg')).toBe('text-gray-500 text-lg')
      expect(cn('flex items-center', 'grid')).toBe('items-center grid')
    })
  })

  describe('debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should debounce function calls', () => {
      const callback = vi.fn()
      const debounced = debounce(callback, 100)

      // Call multiple times
      debounced()
      debounced()
      debounced()

      // Function should not be called yet
      expect(callback).not.toHaveBeenCalled()

      // Fast-forward time by 50ms
      vi.advanceTimersByTime(50)
      expect(callback).not.toHaveBeenCalled()

      // Fast-forward to 100ms
      vi.advanceTimersByTime(50)
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should reset timer on new calls', () => {
      const callback = vi.fn()
      const debounced = debounce(callback, 100)

      debounced()
      vi.advanceTimersByTime(50) // 50ms pass
      debounced() // This should reset the timer
      vi.advanceTimersByTime(50) // 100ms from first call, but only 50ms from second
      expect(callback).not.toHaveBeenCalled()

      vi.advanceTimersByTime(50) // 100ms from second call
      expect(callback).toHaveBeenCalledTimes(1)
    })
  })

  describe('memoize', () => {
    it('should cache function results', () => {
      const expensiveFunction = vi.fn().mockImplementation((a, b) => a + b)
      const memoized = memoize(expensiveFunction)

      // First call
      expect(memoized(1, 2)).toBe(3)
      expect(expensiveFunction).toHaveBeenCalledTimes(1)

      // Same args should use cached result
      expect(memoized(1, 2)).toBe(3)
      expect(expensiveFunction).toHaveBeenCalledTimes(1) // Should still be 1

      // Different args should call again
      expect(memoized(2, 3)).toBe(5)
      expect(expensiveFunction).toHaveBeenCalledTimes(2)
    })

    it('should properly serialize different argument types', () => {
      const complexFunction = vi.fn().mockImplementation(
        (obj: Record<string, unknown>, arr: unknown[]) => JSON.stringify({ obj, arr })
      )
      const memoized = memoize(complexFunction)

      const obj1 = { a: 1, b: 2 }
      const arr1 = [1, 2, 3]

      // First call
      const result1 = memoized(obj1, arr1)
      expect(complexFunction).toHaveBeenCalledTimes(1)

      // Same args (different object instances but same values)
      const result2 = memoized({ a: 1, b: 2 }, [1, 2, 3])
      expect(result2).toBe(result1)
      expect(complexFunction).toHaveBeenCalledTimes(1) // Should still be 1

      // Different args
      memoized({ a: 2, b: 3 }, [1, 2, 3])
      expect(complexFunction).toHaveBeenCalledTimes(2)
    })
  })
}) 