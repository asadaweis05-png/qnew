import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent/50 hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        cinematic: [
          "relative overflow-hidden",
          "bg-gradient-to-r from-teal to-primary",
          "text-primary-foreground font-medium tracking-wide",
          "shadow-lg shadow-teal/20",
          "hover:shadow-xl hover:shadow-teal/30",
          "hover:scale-[1.02]",
          "active:scale-[0.98]",
          "before:absolute before:inset-0",
          "before:bg-gradient-to-r before:from-orange before:to-secondary",
          "before:opacity-0 before:transition-opacity before:duration-500",
          "hover:before:opacity-100",
          "[&>*]:relative [&>*]:z-10",
        ],
        glowing: [
          "relative overflow-hidden",
          "bg-card/80 backdrop-blur-sm",
          "border border-border/50",
          "text-foreground",
          "hover:border-teal/50",
          "hover:bg-card",
          "hover:scale-[1.02]",
          "active:scale-[0.98]",
        ],
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-md px-4",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
