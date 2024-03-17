import { RouterOutput } from "@/server/trpc"
import { formatDistanceToNowStrict } from "date-fns"
import { Github } from "./icons/Github"
import { cn } from "@/utils"

interface IssueDetailsProps {
  bountyExists: boolean
  issue: RouterOutput["getIssueMeta"]["issue"]
  org: string
  repo: string
  issueNumber: number
  className?: string
}

export const IssueDetails = ({
  bountyExists,
  issue,
  org,
  repo,
  issueNumber,
  className,
}: IssueDetailsProps) => {
  return (
    <div className={cn("flex gap-3 items-start flex-col", className)}>
      <div className="flex gap-4 items-center text-sm">
        {bountyExists ? (
          <div className="bg-green-700 rounded-full text-white px-4 py-1 font-medium inline-block">
            Open
          </div>
        ) : (
          <div className="text-gray-800 rounded-full px-4 py-1 font-medium inline-block border-dashed border-2 border-gray-300">
            No bounty
          </div>
        )}
        <div className="text-gray-500 font-sm flex gap-4">
          <span>
            issue {formatDistanceToNowStrict(new Date(issue.created_at!))} old
          </span>
          <span>/</span>
          <span>bit not very old</span>
        </div>
      </div>
      <h1 className="text-2xl font-medium">
        {bountyExists ? "Community-created bounty for" : "Create bounty for"}{" "}
        {org}#{issueNumber}
      </h1>
      <h2 className="text-lg text-gray-500 line-clamp-1">{issue.title}</h2>

      <a
        href={issue.html_url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex gap-2 items-center"
      >
        <Github />
        <div className="flex gap-1 items-center font-mono text-sm text-gray-500">
          <span>{org}</span>
          <span>/</span>
          <span>{repo}</span>
          <span>#</span>
          <span>{issue.number}</span>
        </div>
      </a>
    </div>
  )
}
