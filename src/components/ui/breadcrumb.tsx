import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { ChevronRight, Home, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { useNavigate } from "react-router-dom"

interface BreadcrumbItemType {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"nav"> & {
    separator?: React.ReactNode
  }
>(({ className, ...props }, ref) => {
  // Check if dark mode is active
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  return (
    <nav 
      ref={ref} 
      aria-label="breadcrumb" 
      className={cn(
        "mb-4 transition-colors",
        isDarkMode ? "text-slate-300" : "text-gray-700",
        className
      )} 
      {...props} 
    />
  )
})
Breadcrumb.displayName = "Breadcrumb"

const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.ComponentPropsWithoutRef<"ol">
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn(
      "flex flex-wrap items-center gap-1.5 break-words text-sm sm:gap-2.5",
      className
    )}
    {...props}
  />
))
BreadcrumbList.displayName = "BreadcrumbList"

const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("inline-flex items-center gap-1.5", className)}
    {...props}
  />
))
BreadcrumbItem.displayName = "BreadcrumbItem"

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a"> & {
    asChild?: boolean
    active?: boolean
  }
>(({ asChild, className, active, ...props }, ref) => {
  const Comp = asChild ? Slot : "a"
  const isDarkMode = document.documentElement.classList.contains('dark');

  return (
    <Comp
      ref={ref}
      className={cn(
        "transition-colors duration-200 hover:text-primary flex items-center",
        active 
          ? isDarkMode 
            ? "text-white font-medium" 
            : "text-gray-900 font-medium" 
          : isDarkMode 
            ? "text-slate-400 hover:text-slate-200" 
            : "text-gray-600 hover:text-gray-900",
        className
      )}
      aria-current={active ? "page" : undefined}
      {...props}
    />
  )
})
BreadcrumbLink.displayName = "BreadcrumbLink"

const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span">
>(({ className, ...props }, ref) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  return (
    <span
      ref={ref}
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn(
        "font-medium flex items-center",
        isDarkMode ? "text-white" : "text-gray-900",
        className
      )}
      {...props}
    />
  )
})
BreadcrumbPage.displayName = "BreadcrumbPage"

const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  return (
    <li
      role="presentation"
      aria-hidden="true"
      className={cn(
        "[&>svg]:size-3.5", 
        isDarkMode ? "text-slate-500" : "text-gray-400",
        className
      )}
      {...props}
    >
      {children ?? <ChevronRight className="h-4 w-4" />}
    </li>
  )
}
BreadcrumbSeparator.displayName = "BreadcrumbSeparator"

const BreadcrumbEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  return (
    <span
      role="presentation"
      aria-hidden="true"
      className={cn(
        "flex h-9 w-9 items-center justify-center",
        isDarkMode ? "text-slate-400" : "text-gray-500",
        className
      )}
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">More</span>
    </span>
  )
}
BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis"

// Convenience component for rendering a complete breadcrumb
const BreadcrumbWithItems = ({
  items,
  className,
  homeHref = "/",
  showHomeIcon = true,
  separator,
  maxItems = 4
}: {
  items: BreadcrumbItemType[]
  className?: string
  homeHref?: string
  showHomeIcon?: boolean
  separator?: React.ReactNode
  maxItems?: number
}) => {
  const navigate = useNavigate();
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  // Logic for truncating breadcrumbs when there are many items
  const visibleItems = items.length > maxItems
    ? [
        ...items.slice(0, Math.max(1, maxItems - 2)),
        { label: "..." } as BreadcrumbItemType,
        items[items.length - 1]
      ]
    : items;

  return (
    <Breadcrumb
      className={cn(
        "px-1",
        isDarkMode ? "text-slate-300" : "text-gray-700",
        className
      )}
    >
      <BreadcrumbList>
        {showHomeIcon && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink
                onClick={() => navigate(homeHref)}
                className={cn("cursor-pointer hover:opacity-80 transition-opacity")}
              >
                <Home className="h-3.5 w-3.5" />
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>
          </>
        )}
        
        {visibleItems.map((item, index) => {
          const isLast = index === visibleItems.length - 1;
          const isEllipsis = item.label === "...";
          
          return (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                {isEllipsis ? (
                  <BreadcrumbEllipsis />
                ) : isLast ? (
                  <BreadcrumbPage>
                    {item.icon && <span className="mr-1.5">{item.icon}</span>}
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    onClick={() => item.href && navigate(item.href)}
                    className={cn(
                      item.href && "cursor-pointer hover:opacity-80 transition-opacity"
                    )}
                  >
                    {item.icon && <span className="mr-1.5">{item.icon}</span>}
                    {item.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
  BreadcrumbWithItems,
  type BreadcrumbItemType
}
