/**
 * Utility functions for comparing values
 */

/**
 * Deep equality check for JavaScript values
 * More reliable than direct comparison for arrays and objects
 */
export function isEqual(a: unknown, b: unknown): boolean {
  // Handle primitive types and null/undefined
  if (a === b) return true;
  if (a == null || b == null) return a === b;
  
  // Handle dates
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }
  
  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    
    for (let i = 0; i < a.length; i++) {
      if (!isEqual(a[i], b[i])) return false;
    }
    
    return true;
  }
  
  // Handle objects
  if (typeof a === 'object' && typeof b === 'object') {
    const objA = a as Record<string, unknown>;
    const objB = b as Record<string, unknown>;
    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);
    
    if (keysA.length !== keysB.length) return false;
    
    for (const key of keysA) {
      if (!Object.prototype.hasOwnProperty.call(objB, key)) return false;
      if (!isEqual(objA[key], objB[key])) return false;
    }
    
    return true;
  }
  
  // Default case for other types
  return false;
}
