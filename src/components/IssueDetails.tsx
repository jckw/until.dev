import { Github } from "./icons/Github"
import { Tags } from "./Tag"

import { RouterOutput } from "@/server/trpc"
import { cn } from "@/utils"

interface IssueDetailsProps {
  org: string
  repo: string
  meta: RouterOutput["getIssueMeta"]
  className?: string
}

export const IssueDetails = ({ meta, org, repo }: IssueDetailsProps) => {
  return (
    <div className={cn("flex gap-3 items-center flex-col")}>
      <Tags meta={meta} />
      <GitHubLink org={org} repo={repo} meta={meta} />

      <h1 className="text-2xl font-medium">
        {meta.bounty ? "Community-created bounty for" : "Create bounty for"}{" "}
        {repo}#{meta.issue?.number}
      </h1>
      <h2 className="text-lg text-gray-500 line-clamp-1">
        {meta.issue?.title}
      </h2>
    </div>
  )
}

const GitHubLink = ({
  org,
  repo,
  meta,
}: {
  org: string
  repo: string
  meta: RouterOutput["getIssueMeta"]
}) => {
  return (
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
  )
}
