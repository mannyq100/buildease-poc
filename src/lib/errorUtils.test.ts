import { describe, it, expect, vi, beforeEach } from 'vitest'
import { formatError } from './errorUtils'

describe('errorUtils', () => {
  describe('formatError', () => {
    beforeEach(() => {
      // Mock Date.now to ensure consistent timestamps for testing
      vi.spyOn(Date.prototype, 'toISOString').mockReturnValue('2023-01-01T00:00:00.000Z')
    })

    it('should format string errors', () => {
      const result = formatError('Error message')
      expect(result).toEqual({
        message: 'Error message',
        timestamp: '2023-01-01T00:00:00.000Z'
      })
    })

    it('should format Error objects', () => {
      const error = new Error('Error message')
      error.stack = 'Error stack trace'
      const result = formatError(error)
      expect(result).toEqual({
        message: 'Error message',
        details: 'Error stack trace',
        timestamp: '2023-01-01T00:00:00.000Z'
      })
    })

    it('should format objects with message property', () => {
      const error = { 
        message: 'Error message', 
        code: 'ERROR_CODE',
        details: 'More details'
      }
      const result = formatError(error)
      expect(result).toEqual({
        message: 'Error message',
        code: 'ERROR_CODE',
        details: 'More details',
        timestamp: '2023-01-01T00:00:00.000Z'
      })
    })

    it('should handle unknown error types', () => {
      const result = formatError(null)
      expect(result).toEqual({
        message: 'An unknown error occurred',
        timestamp: '2023-01-01T00:00:00.000Z'
      })
    })
  })

  // Note: We don't directly test useErrorHandler here since it uses React hooks
  // and would require a more complex component testing setup. 
  // We could test it with a dedicated React testing approach if needed.
}) 