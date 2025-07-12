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
          return "border-2 border-buildease-blue-200 dark:border-buildease-blue-700 rounded-xl bg-gradient-to-br from-buildease-blue-50/30 to-white dark:from-buildease-blue-950/40 dark:to-gray-950 shadow-sm";
        default:
          return "border border-buildease-blue-200/50 dark:border-buildease-blue-800/50 rounded-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg";
      }
    };

    const getPriorityStyles = (priority?: "high" | "medium" | "low") => {
      if (!priority) return "";
      switch (priority) {
        case "high":
          return "border-l-4 border-buildease-orange-500 dark:border-buildease-orange-400 bg-gradient-to-r from-buildease-orange-50/30 via-buildease-orange-50/10 to-transparent dark:from-buildease-orange-950/20 dark:via-buildease-orange-950/10 dark:to-transparent";
        case "medium":
          return "border-l-4 border-buildease-blue-500 dark:border-buildease-blue-400 bg-gradient-to-r from-buildease-blue-50/30 via-buildease-blue-50/10 to-transparent dark:from-buildease-blue-950/20 dark:via-buildease-blue-950/10 dark:to-transparent";
        case "low":
          return "border-l-4 border-status-completed dark:border-status-completed bg-gradient-to-r from-green-50/30 via-green-50/10 to-transparent dark:from-green-950/20 dark:via-green-950/10 dark:to-transparent";
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
            <AccordionTrigger className="hover:no-underline py-5 px-5 transition-all duration-200 hover:bg-buildease-blue-50/40 dark:hover:bg-buildease-blue-950/30 rounded-lg mx-1">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  {section.icon && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-buildease-blue-100 dark:bg-buildease-blue-900/30 text-buildease-blue-600 dark:text-buildease-blue-400 shadow-sm">
                      {section.icon}
                    </div>
                  )}
                  <span className="font-bold text-left bg-gradient-to-r from-buildease-blue-900 via-buildease-blue-800 to-buildease-blue-900 dark:from-buildease-blue-100 dark:via-white dark:to-buildease-blue-100 bg-clip-text text-transparent">{section.title}</span>
                </div>
                <div className="flex items-center gap-3">
                  {section.badge && (
                    <Badge 
                      variant={section.badgeVariant || "secondary"} 
                      className={cn(
                        "text-xs px-2 py-1",
                        section.badgeVariant === "outline" 
                          ? "border-buildease-blue-300 text-buildease-blue-700 dark:border-buildease-blue-600 dark:text-buildease-blue-300"
                          : "bg-buildease-blue-100 text-buildease-blue-800 dark:bg-buildease-blue-900/30 dark:text-buildease-blue-200"
                      )}
                    >
                      {section.badge}
                    </Badge>
                  )}
                  {section.priority === "high" && (
                    <div className="w-3 h-3 rounded-full bg-buildease-orange-500 shadow-sm" />
                  )}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-6 pt-2">
              <div className="pl-12 bg-buildease-blue-50/20 dark:bg-buildease-blue-950/10 rounded-lg p-4 border-l-4 border-buildease-blue-500 dark:border-buildease-blue-400">
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
