import { cn } from "@/utils"

export const HowItWorksSection = ({
  org,
  repo,
  issue,
  className,
}: {
  org: string
  repo: string
  issue: number
  className?: string
}) => (
  <div className={cn("p-4 border rounded-md mt-4", className)}>
    <div className="flex gap-3 items-center">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13M12 17H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
          stroke="black"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>

      <div className="text-m font-medium">How does this work?</div>
    </div>
    <div className="mt-2 leading-relaxed text-sm">
      <p className="mb-1">
        If the <span className="text-orange-600 font-mono">{org}</span> closes
        issue <span className="font-mono text-orange-600">#{issue}</span> in{" "}
        <span className="font-mono text-orange-600">{repo}</span>, they will be
        rewarded the bounty.
      </p>
      <p>
        Contibute to the bounty to incentivize its prioritization. If the issue
        is not solved by the expiry date you set, you will be auto-refunded.
      </p>
    </div>
  </div>
)
