import { cn } from "@/utils"
import Link from "next/link"

interface BountyDetailsProps {
  total: number
  available: number
  className?: string
}

export const BountyDetails = ({
  total,
  available,
  className,
}: BountyDetailsProps) => {
  return (
    <div className={cn("", className)}>
      <div className="text-lg font-medium mb-2">Current bounty</div>
      <div className="text-4xl font-extrabold font-display mb-4">
        ${(total / 100).toFixed(2)}
      </div>
      <div className="text-sm text-gray-800 mt-2">
        ~${(available / 100).toFixed(2)} available after{" "}
        <Link
          href="/legal/fees"
          target="_blank"
          style={{ textDecoration: "underline" }}
        >
          fees
        </Link>
      </div>
    </div>
  )
}
