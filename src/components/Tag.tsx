import { RouterOutput } from "@/server/trpc"

const TAG_META: Record<
  Exclude<RouterOutput["getIssueMeta"]["bounty"], null>["status"] | "no_bounty",
  { className: string; text: string }
> = {
  open: {
    className: "bg-green-700 text-white",
    text: "Open",
  },
  paused: {
    className: "bg-yellow-500 text-white",
    text: "Paused",
  },
  closed_and_refunded: {
    className: "bg-red-500 text-white",
    text: "Closed",
  },
  closed_and_claimed: {
    className: "bg-purple-500 text-white",
    text: "Rewarded",
  },
  no_bounty: {
    className: "border-dashed border-2 border-gray-300 text-gray-500",
    text: "No bounty",
  },
}

export const Tag = ({ type }: { type: keyof typeof TAG_META }) => {
  return (
    <div
      className={`${TAG_META[type].className} rounded-full px-4 py-1 font-medium inline-block`}
    >
      {TAG_META[type].text}
    </div>
  )
}

export const Tags = ({ meta }: { meta: RouterOutput["getIssueMeta"] }) => {
  return (
    <div className="flex gap-4 items-center text-sm">
      <Tag type={meta.bounty?.status || "no_bounty"} />
    </div>
  )
}
