import * as React from "react"

import { cn } from "@/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "md" | "lg"
  LeftIcon?: React.ComponentType<{ className?: string }>
  RightIcon?: React.ComponentType<{ className?: string }>
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "md", LeftIcon, RightIcon, ...props }, ref) => {
    return (
      <div className="relative">
        {LeftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <LeftIcon />
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex w-full rounded-md border border-input bg-transparent transition-colors file:border-0 file:bg-transparent placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            variant === "md" &&
              "h-9 px-3 py-1 text-sm file:text-sm file:font-medium",
            variant === "lg" &&
              "h-11 px-4 py-2 text-lg file:text-lg file:font-medium",
            LeftIcon && variant === "lg" ? "pl-11" : "pl-9",
            RightIcon && variant === "lg" ? "pr-11" : "pr-9",
            className
          )}
          ref={ref}
          {...props}
        />
        {RightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <RightIcon />
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
