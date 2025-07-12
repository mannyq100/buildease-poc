/**
 * Mock utility functions
 */

/**
 * Delays execution for a given number of milliseconds
 * @param ms The number of milliseconds to delay
 * @returns A promise that resolves after the delay
 */
export const delay = (ms: number): Promise<void> => new Promise(res => setTimeout(res, ms));
