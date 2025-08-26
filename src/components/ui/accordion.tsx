import * as React from "react"
import * as RadixAccordion from "@radix-ui/react-accordion"
import { cn } from "@/lib/utils"

const Accordion = React.forwardRef<
  React.ElementRef<typeof RadixAccordion.Root>,
  React.ComponentPropsWithoutRef<typeof RadixAccordion.Root>
>(({ className, ...props }, ref) => (
  <RadixAccordion.Root ref={ref} className={cn("space-y-2", className)} {...props} />
))
Accordion.displayName = "Accordion"

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof RadixAccordion.Item>,
  React.ComponentPropsWithoutRef<typeof RadixAccordion.Item>
>(({ className, ...props }, ref) => (
  <RadixAccordion.Item
    ref={ref}
    className={cn(
      "border-b border-border/40 bg-background rounded-lg transition-all",
      className
    )}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof RadixAccordion.Trigger>,
  React.ComponentPropsWithoutRef<typeof RadixAccordion.Trigger>
>(({ className, children, ...props }, ref) => (
  <RadixAccordion.Header className="flex">
    <RadixAccordion.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <svg
        className="ml-2 h-4 w-4 shrink-0 transition-transform duration-200"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </RadixAccordion.Trigger>
  </RadixAccordion.Header>
))
AccordionTrigger.displayName = "AccordionTrigger"

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof RadixAccordion.Content>,
  React.ComponentPropsWithoutRef<typeof RadixAccordion.Content>
>(({ className, ...props }, ref) => (
  <RadixAccordion.Content
    ref={ref}
    className={cn(
      "overflow-hidden text-sm transition-all data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up",
      className
    )}
    {...props}
  />
))
AccordionContent.displayName = "AccordionContent"

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
}
