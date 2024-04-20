import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/ui/tooltip"
import { cn } from "@/utils"

export const Card = ({
  icon,
  title,
  value,
  caption,
  className,
  tooltip,
  children,
}: {
  icon: React.ReactNode
  title: string
  value: number | string
  caption: string
  tooltip?: string
  className?: string
  children?: React.ReactNode
}) => (
  <div
    className={cn(
      "border border-gray-200 rounded-sm p-5 flex flex-col gap-3 justify-between",
      className
    )}
  >
    <div className="flex gap-3 items-center">
      {icon}
      <div className="font-medium text-gray-950 whitespace-nowrap">{title}</div>
    </div>
    {tooltip ? (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger className="flex flex-col gap-0 items-start justify-start text-left w-auto">
            <div className="text-xl">{value}</div>
            <div className="text-gray-800 text-sm">{caption}</div>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="start">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : (
      <div className="flex flex-col gap-0 items-start justify-start text-left w-auto">
        <div className="text-xl">{value}</div>
        <div className="text-gray-800 text-sm">{caption}</div>
      </div>
    )}
    {children}
  </div>
)
