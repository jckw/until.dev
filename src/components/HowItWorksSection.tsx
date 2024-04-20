import { cn } from "@/utils"

export const HowItWorksSection = ({ className }: { className?: string }) => (
  <div className={cn("p-4 bg-stonewall-50 mt-4", className)}>
    <div className="container flex flex-col gap-2 pt-4">
      <div>How does this work?</div>
      <div className="flex justify-between flex-col gap-2 md:flex-row">
        <div className="flex-1 flex gap-3 items-center max-w-[350px]">
          <div className="text-[64px]">01</div>
          <div className="text-lg">
            Find and create bounties for any GitHub issue
          </div>
        </div>
        <div className="flex-1 flex gap-3 items-center max-w-[350px]">
          <div className="text-[64px]">02</div>
          <div className="text-lg">
            Contribute to the crowdfund with an expiry date
          </div>
        </div>
        <div className="flex-1 flex gap-3 items-center max-w-[350px]">
          <div className="text-[64px]">03</div>
          <div className="text-lg">
            Get the issue solved before the expiry or get refunded
          </div>
        </div>
      </div>
    </div>
  </div>
)
