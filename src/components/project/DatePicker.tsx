import React from 'react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

interface DatePickerProps {
  mode?: "single" | "range" | "multiple";
  selected?: Date | Date[] | { from: Date; to: Date };
  onSelect?: (date: Date | Date[] | { from: Date; to: Date } | undefined) => void;
  initialFocus?: boolean;
}

/**
 * Date picker component for selecting dates
 */
export function DatePicker({ mode, selected, onSelect, initialFocus }: DatePickerProps) {
  return (
    <CalendarComponent
      mode={mode}
      selected={selected}
      onSelect={onSelect}
      initialFocus={initialFocus}
    />
  )
} 