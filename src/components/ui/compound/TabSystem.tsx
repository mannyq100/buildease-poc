/**
 * Compound Tab System Components
 * Reusable, accessible, and flexible tab system using compound component pattern
 * Supports keyboard navigation, dynamic content, and customization
 */

import React, { createContext, useContext, useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/core/ui';
import { useKeyboardNavigation, useAria, useScreenReader, useReducedMotion } from '@/hooks/useAccessibility';

// Context for tab system state
interface TabContextValue {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  orientation: 'horizontal' | 'vertical';
  variant: 'default' | 'pills' | 'underline';
  size: 'sm' | 'md' | 'lg';
  registerTab: (tabId: string, element: HTMLElement | null) => void;
  getTabProps: (tabId: string) => object;
  getPanelProps: (tabId: string) => object;
}

const TabContext = createContext<TabContextValue | null>(null);

// Hook to use tab context
function useTabContext() {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error('Tab components must be used within a TabSystem');
  }
  return context;
}

// Main TabSystem component
interface TabSystemProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
}

function TabSystem({
  defaultValue,
  value,
  onValueChange,
  orientation = 'horizontal',
  variant = 'default',
  size = 'md',
  className,
  children
}: TabSystemProps) {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const { generateId, getTabProps, getTabPanelProps } = useAria();
  const { announceNavigation } = useScreenReader();
  const tabsRef = useRef<Map<string, HTMLElement>>(new Map());
  
  const activeTab = value !== undefined ? value : internalValue;
  
  const setActiveTab = useCallback((tabId: string) => {
    if (value === undefined) {
      setInternalValue(tabId);
    }
    onValueChange?.(tabId);
    
    // Announce tab change to screen readers
    const tabElement = tabsRef.current.get(tabId);
    if (tabElement) {
      const tabText = tabElement.textContent || tabId;
      announceNavigation(`Tab: ${tabText}`);
    }
  }, [value, onValueChange, announceNavigation]);

  const registerTab = useCallback((tabId: string, element: HTMLElement | null) => {
    if (element) {
      tabsRef.current.set(tabId, element);
    } else {
      tabsRef.current.delete(tabId);
    }
  }, []);

  const getTabPropsForTab = useCallback((tabId: string) => {
    const isActive = activeTab === tabId;
    const panelId = `panel-${tabId}`;
    
    return {
      ...getTabProps(isActive, panelId),
      id: `tab-${tabId}`,
      'data-tab-id': tabId
    };
  }, [activeTab, getTabProps]);

  const getPanelPropsForTab = useCallback((tabId: string) => {
    const isActive = activeTab === tabId;
    const tabElementId = `tab-${tabId}`;
    
    return {
      ...getTabPanelProps(isActive, tabElementId),
      id: `panel-${tabId}`,
      'data-panel-id': tabId
    };
  }, [activeTab, getTabPanelProps]);

  const contextValue: TabContextValue = useMemo(() => ({
    activeTab,
    setActiveTab,
    orientation,
    variant,
    size,
    registerTab,
    getTabProps: getTabPropsForTab,
    getPanelProps: getPanelPropsForTab
  }), [activeTab, setActiveTab, orientation, variant, size, registerTab, getTabPropsForTab, getPanelPropsForTab]);

  return (
    <TabContext.Provider value={contextValue}>
      <div 
        className={cn(
          'tab-system',
          orientation === 'vertical' && 'flex',
          className
        )}
        role="tablist"
        aria-orientation={orientation}
      >
        {children}
      </div>
    </TabContext.Provider>
  );
}

// TabList component
interface TabListProps {
  className?: string;
  children: React.ReactNode;
}

function TabList({ className, children }: TabListProps) {
  const { orientation, variant, setActiveTab } = useTabContext();
  const listRef = useRef<HTMLDivElement>(null);
  
  const keyboardNav = useKeyboardNavigation({
    orientation,
    onActivate: (index) => {
      const tabButtons = listRef.current?.querySelectorAll('[role="tab"]') as NodeListOf<HTMLElement>;
      if (tabButtons && tabButtons[index]) {
        const tabId = tabButtons[index].getAttribute('data-tab-id');
        if (tabId) {
          setActiveTab(tabId);
        }
      }
    }
  });

  const baseClasses = {
    horizontal: 'flex items-center',
    vertical: 'flex flex-col space-y-1 min-w-[200px] mr-4'
  };

  const variantClasses = {
    default: 'border-b border-gray-200 dark:border-gray-800',
    pills: 'bg-gray-100 dark:bg-gray-800 p-1 rounded-lg',
    underline: 'border-b border-gray-200 dark:border-gray-800'
  };

  // Clone children to add keyboard navigation props
  const enhancedChildren = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        ...keyboardNav.getItemProps(index)
      } as any);
    }
    return child;
  });

  return (
    <div
      ref={listRef}
      className={cn(
        'tab-list',
        baseClasses[orientation],
        orientation === 'horizontal' && variantClasses[variant],
        orientation === 'horizontal' && 'overflow-x-auto hide-scrollbar',
        className
      )}
      role="tablist"
    >
      {enhancedChildren}
    </div>
  );
}

// TabTrigger component
interface TabTriggerProps {
  value: string;
  disabled?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
  children: React.ReactNode;
}

function TabTrigger({ 
  value, 
  disabled = false, 
  icon: Icon, 
  className, 
  children 
}: TabTriggerProps) {
  const { activeTab, setActiveTab, orientation, variant, size, registerTab, getTabProps } = useTabContext();
  const { getAnimationProps } = useReducedMotion();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const isActive = activeTab === value;

  // Register this tab with the context
  useEffect(() => {
    registerTab(value, triggerRef.current);
    return () => registerTab(value, null);
  }, [value, registerTab]);

  const handleClick = useCallback(() => {
    if (!disabled) {
      setActiveTab(value);
    }
  }, [value, disabled, setActiveTab]);

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base'
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'pills':
        return isActive
          ? 'bg-white dark:bg-gray-700 text-[#2B6CB0] dark:text-[#93C5FD] shadow-sm'
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100';
      
      case 'underline':
        return isActive
          ? 'border-b-2 border-[#2B6CB0] text-[#2B6CB0] dark:text-[#93C5FD] font-medium'
          : 'text-gray-600 dark:text-gray-400 hover:text-[#2B6CB0] dark:hover:text-[#93C5FD] border-b-2 border-transparent';
      
      default:
        return isActive
          ? 'border-b-2 border-[#2B6CB0] text-[#2B6CB0] dark:text-[#93C5FD] font-medium'
          : 'text-gray-600 dark:text-gray-400 hover:text-[#2B6CB0] dark:hover:text-[#93C5FD]';
    }
  };

  const tabProps = getTabProps(value);
  const animationProps = getAnimationProps(
    { transition: 'all 200ms ease-in-out' },
    { transition: 'none' }
  );

  return (
    <Button
      ref={triggerRef}
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'tab-trigger',
        sizeClasses[size],
        getVariantClasses(),
        orientation === 'horizontal' && variant !== 'pills' && 'rounded-none',
        orientation === 'vertical' && 'justify-start w-full',
        disabled && 'opacity-50 cursor-not-allowed',
        'focus:outline-none focus:ring-2 focus:ring-[#2B6CB0] focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900',
        'focus-visible:ring-2 focus-visible:ring-[#2B6CB0]',
        className
      )}
      style={animationProps}
      {...tabProps}
      data-state={isActive ? 'active' : 'inactive'}
      data-tab-id={value}
    >
      {Icon && (
        <Icon 
          className={cn(
            'h-4 w-4',
            children && (orientation === 'horizontal' ? 'mr-2' : 'mr-3')
          )} 
          aria-hidden="true"
        />
      )}
      {children}
    </Button>
  );
}

// TabContent component
interface TabContentProps {
  value: string;
  className?: string;
  forceMount?: boolean;
  children: React.ReactNode;
}

function TabContent({ 
  value, 
  className, 
  forceMount = false, 
  children 
}: TabContentProps) {
  const { activeTab, getPanelProps } = useTabContext();
  const { getAnimationProps } = useReducedMotion();
  const contentRef = useRef<HTMLDivElement>(null);
  const isActive = activeTab === value;

  // Focus management for active panels
  useEffect(() => {
    if (isActive && contentRef.current) {
      // Focus the panel when it becomes active, but only if no child element is already focused
      const activeElement = document.activeElement;
      const isChildFocused = contentRef.current.contains(activeElement);
      
      if (!isChildFocused) {
        // Try to focus the first focusable element in the panel
        const focusableElement = contentRef.current.querySelector(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement;
        
        if (focusableElement) {
          focusableElement.focus();
        } else {
          // If no focusable element, focus the panel itself
          contentRef.current.focus();
        }
      }
    }
  }, [isActive]);

  if (!isActive && !forceMount) {
    return null;
  }

  const panelProps = getPanelProps(value);
  const animationProps = getAnimationProps(
    { transition: 'opacity 200ms ease-in-out' },
    { transition: 'none' }
  );

  return (
    <div
      ref={contentRef}
      className={cn(
        'tab-content',
        'focus:outline-none focus:ring-2 focus:ring-[#2B6CB0] focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900',
        'focus-visible:ring-2 focus-visible:ring-[#2B6CB0]',
        !isActive && forceMount && 'hidden',
        className
      )}
      style={animationProps}
      {...panelProps}
      data-state={isActive ? 'active' : 'inactive'}
      data-panel-id={value}
    >
      {children}
    </div>
  );
}

// TabPanels container component
interface TabPanelsProps {
  className?: string;
  children: React.ReactNode;
}

function TabPanels({ className, children }: TabPanelsProps) {
  return (
    <div className={cn('tab-panels flex-1', className)}>
      {children}
    </div>
  );
}

// Compose the compound component
const Tabs = Object.assign(TabSystem, {
  List: TabList,
  Trigger: TabTrigger,
  Content: TabContent,
  Panels: TabPanels
});

export { Tabs, TabSystem, TabList, TabTrigger, TabContent, TabPanels };
export type { TabSystemProps, TabListProps, TabTriggerProps, TabContentProps, TabPanelsProps };