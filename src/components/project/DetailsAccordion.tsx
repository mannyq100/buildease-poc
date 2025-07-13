import * as React from "react";
import { cn } from "@/utils/core/ui";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

export interface AccordionSection {
  id: string;
  title: string;
  badge?: string | number;
  badgeVariant?: "default" | "secondary" | "outline" | "destructive";
  content: React.ReactNode;
  icon?: React.ReactNode;
  priority?: "high" | "medium" | "low";
}

export interface DetailsAccordionProps {
  sections: AccordionSection[];
  defaultExpanded?: string | null;
  allowMultiple?: boolean;
  variant?: "default" | "minimal" | "outlined";
  className?: string;
}

/**
 * DetailsAccordion - Progressive disclosure for project information
 * Features BuildEase styling with priority indicators and badges
 */
const DetailsAccordion = React.forwardRef<
  HTMLDivElement,
  DetailsAccordionProps
>(
  (
    { className, sections, defaultExpanded, allowMultiple, variant = "default", ...props },
    ref
  ) => {
    const getVariantStyles = () => {
      switch (variant) {
        case "minimal":
          return "border-0 shadow-none bg-transparent";
        case "outlined":
          return "border rounded-lg bg-white dark:bg-gray-900 shadow-sm";
        default:
          return "border rounded-lg bg-white dark:bg-gray-900 shadow-sm";
      }
    };

    const getPriorityStyles = (priority?: "high" | "medium" | "low") => {
      if (!priority) return "";
      switch (priority) {
        case "high":
          return "border-l-4 border-slate-900 dark:border-slate-100";
        case "medium":
          return "border-l-4 border-slate-600 dark:border-slate-400";
        case "low":
          return "border-l-4 border-emerald-500 dark:border-emerald-400";
        default:
          return "";
      }
    };

    return (
      <Accordion
        ref={ref}
        type={allowMultiple ? "multiple" : "single"}
        collapsible
        className={cn("w-full", getVariantStyles(), className)}
        defaultValue={defaultExpanded || undefined}
        {...props}
      >
        {sections.map((section) => (
          <AccordionItem 
            key={section.id} 
            value={section.id}
            className={cn(
              "border-0 last:border-b-0",
              getPriorityStyles(section.priority)
            )}
          >
            <AccordionTrigger className="hover:no-underline py-5 px-5 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg mx-1">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  {section.icon && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                      {section.icon}
                    </div>
                  )}
                  <span className="font-semibold text-left text-slate-900 dark:text-slate-100">{section.title}</span>
                </div>
                <div className="flex items-center gap-3">
                  {section.badge && (
                    <Badge 
                      variant={section.badgeVariant || "secondary"} 
                      className="text-xs px-2 py-1 bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                    >
                      {section.badge}
                    </Badge>
                  )}
                  {section.priority === "high" && (
                    <div className="w-3 h-3 rounded-full bg-slate-700 dark:bg-slate-300" />
                  )}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-6 pt-2">
              <div className="pl-12 bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                {section.content}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    );
  }
);

DetailsAccordion.displayName = "DetailsAccordion";

export { DetailsAccordion };
