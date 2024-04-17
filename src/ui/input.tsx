import * as React from "react"

import { cn } from "@/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "md" | "lg"
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "md", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded-md border border-input bg-transparent shadow-sm transition-colors file:border-0 file:bg-transparent placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          variant === "md" &&
            "h-9 px-3 py-1 text-sm file:text-sm file:font-medium",
          variant === "lg" &&
            "h-11 px-4 py-2 text-lg file:text-lg file:font-medium",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
