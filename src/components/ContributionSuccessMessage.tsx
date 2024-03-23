import { cn } from "@/utils"
import { formatDistanceToNowStrict } from "date-fns"
import { toast } from "sonner"

const AddCommentCTA = ({
  org,
  repo,
  issue,
  bountyTotalStr,
  bountyLevelExpiresAt,
}: {
  bountyTotalStr: string
  bountyLevelExpiresAt?: Date | string | null // ISO date
  org: string
  repo: string
  issue: string | number
}) => {
  const withinMsg = bountyLevelExpiresAt
    ? ` within ${formatDistanceToNowStrict(
        bountyLevelExpiresAt
      )}, and decreases after that`
    : ""

  const message = `I just contributed to the bounty on this issue:

${process.env.NEXT_PUBLIC_URL}/bounty/${org}/${repo}/${issue}

The current bounty for completing it is ${bountyTotalStr} if it is closed${withinMsg}.`

  return (
    <div
      className="mt-2 cursor-pointer w-full"
      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
        navigator.clipboard.writeText(message)
        toast.success("Copied to clipboard")
      }}
    >
      <div className="text-xs font-bold text-green-300 text-center p-1 bg-green-800 rounded-t-md">
        CLICK TO COPY
      </div>
      <div
        className="text-sm block p-3 leading-relaxed whitespace-pre-wrap font-mono w-full bg-green-900 text-green-100 rounded-b-md break-words"
        style={{ wordBreak: "break-word" }}
      >
        {message.split("\n").map((line, i) => (
          <p key={i} className="mb-2 last:mb-0 break-words">
            {line}
          </p>
        ))}
      </div>
    </div>
  )
}

export const ContributionSuccessMessage = ({
  org,
  repo,
  issue,
  bountyTotalStr,
  bountyLevelExpiresAt,
  className,
}: {
  org: string
  repo: string
  issue: string | number
  bountyTotalStr: string
  bountyLevelExpiresAt?: Date | string | null
  className?: string
}) => (
  <div
    className={cn(
      "bg-green-100 border-green-300 border p-4 rounded-md text-green-800 font-medium flex flex-col gap-2",
      className
    )}
  >
    <div>
      Your donation was successful! Thank you for contributing to this bounty.
    </div>
    <div>Please mention your contribution on the repo:</div>
    <AddCommentCTA
      org={org}
      repo={repo}
      issue={issue}
      bountyTotalStr={bountyTotalStr}
      bountyLevelExpiresAt={bountyLevelExpiresAt}
    />
  </div>
)
