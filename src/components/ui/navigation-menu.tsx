import * as React from "react"
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu"
import { cva } from "class-variance-authority"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const NavigationMenu = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    ref={ref}
    className={cn(
      "relative z-10 flex max-w-max flex-1 items-center justify-center",
      className
    )}
    {...props}
  >
    {children}
    <NavigationMenuViewport />
  </NavigationMenuPrimitive.Root>
))
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName

const NavigationMenuList = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.List
    ref={ref}
    className={cn(
      "group flex flex-1 list-none items-center justify-center space-x-1",
      className
    )}
    {...props}
  />
))
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName

const NavigationMenuItem = NavigationMenuPrimitive.Item

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 dark:bg-slate-800 dark:hover:bg-slate-700 dark:focus:bg-slate-700 dark:data-[active]:bg-slate-700/50 dark:data-[state=open]:bg-slate-700/50"
)

const NavigationMenuTrigger = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger
    ref={ref}
    className={cn(navigationMenuTriggerStyle(), "group", className)}
    {...props}
  >
    {children}
    <ChevronDown
      className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180"
      aria-hidden="true"
    />
  </NavigationMenuPrimitive.Trigger>
))
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName

const NavigationMenuContent = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Content
    ref={ref}
    className={cn(
      "left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto",
      className
    )}
    {...props}
  />
))
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName

const NavigationMenuLink = NavigationMenuPrimitive.Link

const NavigationMenuViewport = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(({ className, ...props }, ref) => {
  // Check if dark mode is active
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  return (
    <div className={cn("absolute left-0 top-full flex justify-center")}>
      <NavigationMenuPrimitive.Viewport
        ref={ref}
        className={cn(
          "origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-lg border shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]",
          isDarkMode 
            ? "bg-slate-800 border-slate-700 text-slate-200" 
            : "bg-white border-gray-200 text-gray-900",
          className
        )}
        {...props}
      />
    </div>
  )
})
NavigationMenuViewport.displayName =
  NavigationMenuPrimitive.Viewport.displayName

const NavigationMenuIndicator = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Indicator>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Indicator
    ref={ref}
    className={cn(
      "top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in",
      className
    )}
    {...props}
  >
    <div
      className="relative top-[60%] h-2 w-2 rotate-45 bg-accent dark:bg-slate-700"
    />
  </NavigationMenuPrimitive.Indicator>
))
NavigationMenuIndicator.displayName =
  NavigationMenuPrimitive.Indicator.displayName

const NavigationMenuWithDemo = () => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Features</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className={cn(
              "grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]",
              isDarkMode ? "bg-slate-800" : ""
            )}>
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className={cn(
                      "flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-blue-500 to-indigo-600 p-6 no-underline outline-none transition-colors focus:shadow-md",
                      isDarkMode ? "from-blue-600 to-indigo-800" : ""
                    )}
                    href="#"
                  >
                    <div className="mt-4 mb-2 text-lg font-medium text-white">
                      BuildEase Pro
                    </div>
                    <p className="text-sm leading-tight text-white/90">
                      Access premium features and take your project management to the next level
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem
                href="#"
                title="Projects"
                description="Track and manage all your construction projects in one place"
              />
              <ListItem
                href="#"
                title="Team Management"
                description="Coordinate your team and manage resources efficiently"
              />
              <ListItem
                href="#"
                title="Documentation"
                description="Access all your project documents and blueprints"
              />
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className={cn(
              "grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]",
              isDarkMode ? "bg-slate-800" : ""
            )}>
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className={cn(
                      "flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-green-500 to-emerald-600 p-6 no-underline outline-none focus:shadow-md",
                      isDarkMode ? "from-green-600 to-emerald-800" : ""
                    )}
                    href="#"
                  >
                    <div className="mt-4 mb-2 text-lg font-medium text-white">
                      Support
                    </div>
                    <p className="text-sm leading-tight text-white/90">
                      Get assistance with BuildEase and learn best practices
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem
                href="#"
                title="Knowledge Base"
                description="Find guides and answers to frequently asked questions"
              />
              <ListItem
                href="#"
                title="Tutorials"
                description="Step-by-step instructions for using BuildEase effectively"
              />
              <ListItem
                href="#"
                title="Community"
                description="Connect with other construction professionals"
              />
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & {
    title: string
    description: string
  }
>(({ className, title, description, children, ...props }, ref) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            isDarkMode 
              ? "hover:bg-slate-700 focus:bg-slate-700" 
              : "hover:bg-slate-100 focus:bg-slate-100",
            className
          )}
          {...props}
        >
          <div className={cn(
            "text-sm font-medium leading-none",
            isDarkMode ? "text-white" : "text-slate-900"
          )}>
            {title}
          </div>
          <p className={cn(
            "line-clamp-2 text-sm leading-snug",
            isDarkMode ? "text-slate-300" : "text-slate-500"
          )}>
            {description}
          </p>
          {children}
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"

export {
  navigationMenuTriggerStyle,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  NavigationMenuWithDemo,
  ListItem
}
