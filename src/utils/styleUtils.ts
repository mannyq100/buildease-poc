/**
 * Style injection utility for React 19 compatibility
 * Prevents "Maximum update depth exceeded" errors caused by style injection during renders
 */

// Track which style sheets have been injected to prevent duplicates
const injectedStyles = new Set<string>();

/**
 * Safely injects CSS styles once into the document head
 * This should be called in a useEffect with an empty dependency array
 * @param css The CSS styles to inject
 * @param id Optional unique identifier for the style
 * @returns A cleanup function to remove the style element if needed
 */
export function injectStyles(css: string, id?: string): () => void {
  if (typeof document === 'undefined') {
    return () => {}; // No-op for SSR
  }
  
  const styleId = id || `style-${css.length}-${Math.random().toString(36).substring(2, 9)}`;
  
  // Don't inject the same styles twice
  if (injectedStyles.has(styleId)) {
    return () => {};
  }
  
  const style = document.createElement('style');
  style.setAttribute('data-injected-id', styleId);
  style.textContent = css;
  document.head.appendChild(style);
  injectedStyles.add(styleId);
  
  // Return cleanup function
  return () => {
    const styleElement = document.querySelector(`style[data-injected-id="${styleId}"]`);
    if (styleElement) {
      document.head.removeChild(styleElement);
      injectedStyles.delete(styleId);
    }
  };
}

/**
 * Utility to create class names with dynamic string interpolation
 * that won't cause re-renders in React 19
 * @param strings The CSS class strings
 * @param dynamicValues The dynamic values to interpolate
 * @returns A memoized class name string
 */
export function cx(strings: TemplateStringsArray, ...dynamicValues: any[]): string {
  return strings.reduce((acc, str, i) => {
    return acc + str + (dynamicValues[i] || '');
  }, '');
}

/**
 * React hook to safely inject styles once
 * @param css The CSS to inject
 * @param id Optional unique identifier
 */
export function useStyles(css: string, id?: string): void {
  // This should be called in components with useEffect(() => { ... }, [])
  if (typeof document !== 'undefined' && !injectedStyles.has(id || css)) {
    injectStyles(css, id);
  }
}
