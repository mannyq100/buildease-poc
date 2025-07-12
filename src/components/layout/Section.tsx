import * as React from "react";
import { cn } from "@/utils/core/ui";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/Accordion";

export interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

const Section = React.forwardRef<HTMLDivElement, SectionProps>(
  ({ className, title, collapsible, defaultExpanded, children, ...props }, ref) => {
    if (collapsible) {
      return (
        <Accordion type="single" collapsible defaultValue={defaultExpanded ? "item-1" : undefined}>
          <AccordionItem value="item-1">
            <AccordionTrigger>{title}</AccordionTrigger>
            <AccordionContent>
              <div ref={ref} className={cn("py-4", className)} {...props}>
                {children}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );
    }

    return (
      <section ref={ref} className={cn("py-8", className)} {...props}>
        {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}
        {children}
      </section>
    );
  }
);

Section.displayName = "Section";

export { Section };
