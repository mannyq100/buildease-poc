/**
 * Accessibility Hooks for BuildEase
 * Comprehensive accessibility utilities including keyboard navigation, focus management,
 * screen reader support, and ARIA enhancements
 */

import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';

// Keyboard Navigation Hook
export function useKeyboardNavigation({
  orientation = 'horizontal',
  loop = true,
  onActivate,
  onEscape
}: {
  orientation?: 'horizontal' | 'vertical';
  loop?: boolean;
  onActivate?: (index: number) => void;
  onEscape?: () => void;
} = {}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsRef = useRef<HTMLElement[]>([]);

  const getNavigationKeys = useMemo(() => {
    if (orientation === 'vertical') {
      return {
        next: ['ArrowDown'],
        previous: ['ArrowUp'],
        first: ['Home'],
        last: ['End']
      };
    }
    return {
      next: ['ArrowRight'],
      previous: ['ArrowLeft'],
      first: ['Home'],
      last: ['End']
    };
  }, [orientation]);

  const focusItem = useCallback((index: number) => {
    const item = itemsRef.current[index];
    if (item) {
      item.focus();
      setCurrentIndex(index);
    }
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const { next, previous, first, last } = getNavigationKeys;
    const itemCount = itemsRef.current.length;
    
    if (itemCount === 0) return;

    let newIndex = currentIndex;

    if (next.includes(e.key)) {
      e.preventDefault();
      newIndex = currentIndex + 1;
      if (newIndex >= itemCount) {
        newIndex = loop ? 0 : itemCount - 1;
      }
    } else if (previous.includes(e.key)) {
      e.preventDefault();
      newIndex = currentIndex - 1;
      if (newIndex < 0) {
        newIndex = loop ? itemCount - 1 : 0;
      }
    } else if (first.includes(e.key)) {
      e.preventDefault();
      newIndex = 0;
    } else if (last.includes(e.key)) {
      e.preventDefault();
      newIndex = itemCount - 1;
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onActivate?.(currentIndex);
      return;
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onEscape?.();
      return;
    }

    if (newIndex !== currentIndex) {
      focusItem(newIndex);
    }
  }, [currentIndex, getNavigationKeys, loop, onActivate, onEscape, focusItem]);

  const registerItem = useCallback((element: HTMLElement | null, index: number) => {
    if (element) {
      itemsRef.current[index] = element;
    }
  }, []);

  const getItemProps = useCallback((index: number) => ({
    ref: (el: HTMLElement | null) => registerItem(el, index),
    tabIndex: index === currentIndex ? 0 : -1,
    onKeyDown: handleKeyDown,
    onFocus: () => setCurrentIndex(index)
  }), [currentIndex, handleKeyDown, registerItem]);

  return {
    currentIndex,
    setCurrentIndex,
    getItemProps,
    focusItem,
    registerItem
  };
}

// Focus Management Hook
export function useFocusManagement() {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const storePreviousFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  }, []);

  const restorePreviousFocus = useCallback(() => {
    if (previousFocusRef.current && document.contains(previousFocusRef.current)) {
      previousFocusRef.current.focus();
    }
  }, []);

  const getFocusableElements = useCallback((container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
  }, []);

  const trapFocus = useCallback((containerRef: React.RefObject<HTMLElement>) => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !containerRef.current) return;

      const focusableElements = getFocusableElements(containerRef.current);
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [getFocusableElements]);

  const focusFirstElement = useCallback((container: HTMLElement) => {
    const focusableElements = getFocusableElements(container);
    focusableElements[0]?.focus();
  }, [getFocusableElements]);

  return {
    storePreviousFocus,
    restorePreviousFocus,
    getFocusableElements,
    trapFocus,
    focusFirstElement
  };
}

// Screen Reader Announcements Hook
export function useScreenReader() {
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const announcementRef = useRef<HTMLDivElement>(null);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncements(prev => [...prev, message]);
    
    // Clear announcement after a delay
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(announcement => announcement !== message));
    }, 1000);

    // Also log for debugging
    console.log(`Screen Reader (${priority}):`, message);
  }, []);

  const announceNavigation = useCallback((currentPage: string, totalPages?: number) => {
    const message = totalPages 
      ? `Navigated to ${currentPage}, ${totalPages} total pages`
      : `Navigated to ${currentPage}`;
    announce(message);
  }, [announce]);

  const announceStatus = useCallback((status: string, details?: string) => {
    const message = details ? `${status}: ${details}` : status;
    announce(message, 'assertive');
  }, [announce]);

  const getAnnouncementElement = useCallback((): React.ReactElement => (
    React.createElement('div', {
      ref: announcementRef,
      'aria-live': 'polite',
      'aria-atomic': 'true',
      className: 'sr-only',
      role: 'status'
    }, announcements.map((announcement, index) => 
      React.createElement('div', { key: index }, announcement)
    ))
  ), [announcements]);

  return {
    announce,
    announceNavigation,
    announceStatus,
    getAnnouncementElement
  };
}

// ARIA Utilities Hook
export function useAria() {
  const generateId = useCallback((prefix: string = 'aria') => {
    return `${prefix}-${Math.random().toString(36).substring(2, 11)}`;
  }, []);

  const getAriaProps = useCallback((options: {
    label?: string;
    labelledBy?: string;
    describedBy?: string;
    expanded?: boolean;
    selected?: boolean;
    disabled?: boolean;
    required?: boolean;
    invalid?: boolean;
    live?: 'polite' | 'assertive' | 'off';
    role?: string;
  }) => {
    const props: Record<string, string | boolean> = {};

    if (options.label) props['aria-label'] = options.label;
    if (options.labelledBy) props['aria-labelledby'] = options.labelledBy;
    if (options.describedBy) props['aria-describedby'] = options.describedBy;
    if (options.expanded !== undefined) props['aria-expanded'] = options.expanded;
    if (options.selected !== undefined) props['aria-selected'] = options.selected;
    if (options.disabled !== undefined) props['aria-disabled'] = options.disabled;
    if (options.required !== undefined) props['aria-required'] = options.required;
    if (options.invalid !== undefined) props['aria-invalid'] = options.invalid;
    if (options.live) props['aria-live'] = options.live;
    if (options.role) props['role'] = options.role;

    return props;
  }, []);

  const getTabProps = useCallback((isActive: boolean, controls?: string) => ({
    role: 'tab',
    'aria-selected': isActive,
    'aria-controls': controls,
    tabIndex: isActive ? 0 : -1
  }), []);

  const getTabPanelProps = useCallback((isActive: boolean, labelledBy?: string) => ({
    role: 'tabpanel',
    'aria-hidden': !isActive,
    'aria-labelledby': labelledBy,
    tabIndex: 0
  }), []);

  const getModalProps = useCallback((isOpen: boolean, labelledBy?: string, describedBy?: string) => ({
    role: 'dialog',
    'aria-modal': true,
    'aria-hidden': !isOpen,
    'aria-labelledby': labelledBy,
    'aria-describedby': describedBy
  }), []);

  const getMenuProps = useCallback(() => ({
    role: 'menu',
    'aria-orientation': 'vertical'
  }), []);

  const getMenuItemProps = useCallback((disabled?: boolean) => ({
    role: 'menuitem',
    'aria-disabled': disabled,
    tabIndex: disabled ? -1 : 0
  }), []);

  return {
    generateId,
    getAriaProps,
    getTabProps,
    getTabPanelProps,
    getModalProps,
    getMenuProps,
    getMenuItemProps
  };
}

// Reduced Motion Hook
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const getAnimationProps = useCallback((normalProps: object, reducedProps: object = {}) => {
    return prefersReducedMotion ? { ...normalProps, ...reducedProps } : normalProps;
  }, [prefersReducedMotion]);

  return {
    prefersReducedMotion,
    getAnimationProps
  };
}

// Skip Links Hook
export function useSkipLinks() {
  const skipLinksRef = useRef<HTMLDivElement>(null);

  const addSkipLink = useCallback((target: string, label: string) => {
    const skipLink = document.createElement('a');
    skipLink.href = `#${target}`;
    skipLink.textContent = label;
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50';
    
    if (skipLinksRef.current) {
      skipLinksRef.current.appendChild(skipLink);
    }
  }, []);

  const getSkipLinksContainer = useCallback((): React.ReactElement => (
    React.createElement('div', {
      ref: skipLinksRef,
      className: 'skip-links'
    })
  ), []);

  useEffect(() => {
    // Add common skip links
    addSkipLink('main-content', 'Skip to main content');
    addSkipLink('navigation', 'Skip to navigation');
  }, [addSkipLink]);

  return {
    addSkipLink,
    getSkipLinksContainer
  };
}

// High Contrast Mode Hook
export function useHighContrast() {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    // Check for high contrast preference
    const checkHighContrast = () => {
      const isHighContrastMode = window.matchMedia('(prefers-contrast: high)').matches ||
                                window.matchMedia('(-ms-high-contrast: active)').matches;
      setIsHighContrast(isHighContrastMode);
    };

    checkHighContrast();

    // Listen for changes
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    mediaQuery.addEventListener('change', checkHighContrast);

    return () => mediaQuery.removeEventListener('change', checkHighContrast);
  }, []);

  const getHighContrastClasses = useCallback((normalClasses: string, highContrastClasses?: string) => {
    return isHighContrast && highContrastClasses 
      ? `${normalClasses} ${highContrastClasses}`
      : normalClasses;
  }, [isHighContrast]);

  return {
    isHighContrast,
    getHighContrastClasses
  };
}

// Composite Accessibility Hook
export function useAccessibility(options: {
  announceNavigation?: boolean;
  trapFocus?: boolean;
  keyboardNavigation?: boolean;
  orientation?: 'horizontal' | 'vertical';
} = {}) {
  const {
    announceNavigation = false,
    trapFocus = false,
    keyboardNavigation = false,
    orientation = 'horizontal'
  } = options;

  const screenReader = useScreenReader();
  const focusManagement = useFocusManagement();
  const keyboardNav = useKeyboardNavigation({ orientation });
  const aria = useAria();
  const reducedMotion = useReducedMotion();
  const skipLinks = useSkipLinks();
  const highContrast = useHighContrast();

  return {
    screenReader: announceNavigation ? screenReader : undefined,
    focusManagement: trapFocus ? focusManagement : undefined,
    keyboardNavigation: keyboardNavigation ? keyboardNav : undefined,
    aria,
    reducedMotion,
    skipLinks,
    highContrast
  };
}