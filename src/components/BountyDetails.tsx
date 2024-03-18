import { cn } from "@/utils"

interface BountyDetailsProps {
  totalInCents: number
  className?: string
}

export const BountyDetails = ({
  totalInCents,
  className,
}: BountyDetailsProps) => {
  return (
    <div className={cn("", className)}>
      <div className="text-lg font-medium mb-2">Current bounty</div>
      <div className="text-4xl font-extrabold font-display mb-4">
        ${(totalInCents / 100).toFixed(2)}
      </div>
      <div className="text-sm text-gray-800 mt-2">
        ~${((totalInCents / 100) * 0.95).toFixed(2)} after transaction fees
      </div>
    </div>
  )
}
