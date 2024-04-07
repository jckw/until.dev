import { RouterOutput } from "@/server/trpc"
import { formatDistanceToNowStrict } from "date-fns"
import { Github } from "./icons/Github"
import { cn } from "@/utils"

interface IssueDetailsProps {
  org: string
  repo: string
  meta: RouterOutput["getIssueMeta"]
  className?: string
}

export const IssueDetails = ({
  meta,
  org,
  repo,
  className,
}: IssueDetailsProps) => {
  return (
    <div className={cn("flex gap-3 items-start flex-col", className)}>
      <div className="flex gap-4 items-center text-sm">
        {meta.bounty?.status === "open" ? (
          <div className="bg-green-700 rounded-full text-white px-4 py-1 font-medium inline-block">
            Open
          </div>
        ) : null}

        {meta.bounty?.status === "paused" ? (
          <div className="bg-yellow-500 rounded-full text-white px-4 py-1 font-medium inline-block">
            Paused
          </div>
        ) : null}

        {meta.bounty?.status === "closed_and_refunded" ? (
          <div className="bg-red-500 rounded-full text-white px-4 py-1 font-medium inline-block">
            Closed
          </div>
        ) : null}

        {meta.bounty?.status === "closed_and_claimed" ? (
          <div className="bg-purple-500 rounded-full text-white px-4 py-1 font-medium inline-block">
            Closed
          </div>
        ) : null}

        {!meta.bounty ? (
          <div className="text-gray-500 rounded-full px-4 py-1 font-medium inline-block border-dashed border-2 border-gray-300">
            No bounty
          </div>
        ) : null}
        <div className="text-gray-500 font-sm flex gap-4">
          <span>
            issue {formatDistanceToNowStrict(new Date(meta.issue?.created_at!))}{" "}
            old
          </span>
          {meta.bounty ? (
            <>
              <span>/</span>
              <span>
                bounty{" "}
                {formatDistanceToNowStrict(new Date(meta.bounty?.createdAt!))}{" "}
                old
              </span>
            </>
          ) : null}
        </div>
      </div>
      <h1 className="text-2xl font-medium">
        {meta.bounty ? "Community-created bounty for" : "Create bounty for"}{" "}
        {repo}#{meta.issue?.number}
      </h1>
      <h2 className="text-lg text-gray-500 line-clamp-1">
        {meta.issue?.title}
      </h2>

      <a
        href={meta.issue?.html_url}
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
          <span>{meta.issue?.number}</span>
        </div>
      </a>

      {meta.bounty?.status === "paused" ? (
        <div className="rounded border border-yellow-500 p-4 text-yellow-900 font-medium">
          <p className="mb-2">
            This bounty is paused as the repo owner has closed the issue.
            Refunds will therefore not be issued until the{" "}
            {process.env.NEXT_PUBLIC_APP_NAME} team assesses whether the issue
            has been resolved.
          </p>
          <p>
            If the issue is resolved, the bounty will be paid out to the repo
            owner.
          </p>
        </div>
      ) : null}
    </div>
  )
}
