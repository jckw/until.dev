import { toast } from "sonner"

import { cn } from "@/utils"

const AddCommentCTA = ({
  org,
  repo,
  issue,
}: {
  bountyTotalStr: string
  bountyLevelExpiresAt?: Date | string | null // ISO date
  org: string
  repo: string
  issue: string | number
}) => {
  const message = `I just contributed to [the bounty on this issue](${process.env.NEXT_PUBLIC_URL}/bounty/${org}/${repo}/${issue}).

Each contribution to this bounty has an expiry time and will be auto-refunded to the contributor if the issue is not solved before then.

<a href="${process.env.NEXT_PUBLIC_URL}/bounty/${org}/${repo}/${issue}">
  <img src="${process.env.NEXT_PUBLIC_URL}/api/${org}/${repo}/${issue}/chart.svg" alt="Current bounty reward" alt="Until bounty reward timeline" />
</a>

To make this a public bounty or have a reward split, the maintainer can reply to this comment.`

  return (
    <div
      className="mt-2 cursor-pointer w-full"
      onClick={() => {
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
