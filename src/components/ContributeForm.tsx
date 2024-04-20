import { RouterOutput } from "@/server/trpc"
import { Button } from "@/ui/button"
import { Input } from "@/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectTrigger,
  SelectValue,
} from "@/ui/select"
import { cn } from "@/utils"
import { DollarSign, Hourglass } from "lucide-react"
import { useState } from "react"

interface ContributeFormProps {
  org: string
  repo: string
  issue: number
  bountyExists: boolean
  className?: string
  meta: RouterOutput["getIssueMeta"]
}

const expiryOptions: Record<string, string> = {
  one_week: "1 week",
  two_weeks: "2 weeks",
  one_month: "1 month",
  three_months: "3 months",
  six_months: "6 months",
  one_year: "1 year",
  never: "Never",
}

export const ContributeForm = ({
  org,
  repo,
  issue,
  bountyExists,
  meta,
  className,
}: ContributeFormProps) => {
  const [inputAmount, setInputAmount] = useState("50")
  const [inputExpiresIn, setInputExpiresIn] = useState("one_month")

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-col gap-1">
        <div className="text-lg font-medium">
          {bountyExists ? "Make a contribution" : "Create a bounty"}
        </div>
        <div className="text-gray-800">
          {bountyExists
            ? "Contribute to the reward for this bounty"
            : "Contribute the first donation to the reward for this issue"}
        </div>
      </div>

      {meta.bounty?.status === "paused" ? (
        <div className="rounded border border-yellow-500 p-4   flex-col flex gap-2">
          <div className="flex items-center gap-2">
            <Hourglass strokeWidth={1.5} className="stroke-yellow-600" />
            <div className="text-yellow-600">Refunds paused</div>
          </div>
          <div className="text-gray-800 text-sm">
            The repo owner has closed this issue. Refunds are paused until the{" "}
            {process.env.NEXT_PUBLIC_APP_NAME} team determines whether the issue
            is resolved.
          </div>
          <div className="text-gray-800 text-sm">
            If the issue is resolved, the bounty will be rewarded.
          </div>
        </div>
      ) : null}

      <form
        onSubmit={(e) => {
          if (Number(inputAmount) < 3) {
            e.preventDefault()
            return
          }
        }}
        action="/api/checkout"
        method="POST"
        className="flex flex-col gap-3"
      >
        <input type="hidden" name="org" value={org} />
        <input type="hidden" name="repo" value={repo} />

        <input type="hidden" name="issue" value={issue} />

        <div className="flex gap-2 items-center ">
          <Input
            name="amount"
            type="string"
            LeftIcon={() => (
              <DollarSign
                size={16}
                strokeWidth={1.5}
                className="stroke-gray-400"
              />
            )}
            placeholder="0"
            defaultValue={inputAmount}
            onChange={(e) => setInputAmount(e.target.value)}
            className="w-32"
          />

          <Select
            name="expiresIn"
            defaultValue={inputExpiresIn}
            onValueChange={setInputExpiresIn}
          >
            <SelectTrigger
              aria-label="Expires in"
              className="flex-1 relative pl-[116px]"
            >
              <div className="font-mono text-[10px] font-medium text-gray-800 border rounded-full px-2 py-1 h-[23px] w-[100px] flex text-center items-center absolute left-2 tracking-tight">
                auto-refund in
              </div>
              <SelectValue placeholder="Select expiry" />
            </SelectTrigger>
            <SelectContent>
              <SelectScrollUpButton />
              <SelectGroup>
                <SelectItem value="one_week">1 week</SelectItem>
                <SelectItem value="two_weeks">2 weeks</SelectItem>
                <SelectItem value="one_month">1 month</SelectItem>
                <SelectItem value="three_months">3 months</SelectItem>
                <SelectItem value="six_months">6 months</SelectItem>
                <SelectItem value="never">never</SelectItem>
              </SelectGroup>
              <SelectScrollDownButton />
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" size="lg">
          <span className="hidden md:inline">
            {bountyExists ? "Contribute" : "Create bounty for"} $
            {inputAmount || "0"}{" "}
            {inputExpiresIn === "never"
              ? "without expiry"
              : `auto-refunding in ${expiryOptions[inputExpiresIn]}`}
          </span>
          <span className="md:hidden">Contribute ${inputAmount || "0"}</span>
        </Button>
      </form>

      <div className="text-sm text-gray-800">
        If the issue is not completed within {expiryOptions[inputExpiresIn]},
        you will be auto-refunded your full contribution amount to the card you
        paid with.
      </div>

      {Number(inputAmount) < 3 ? (
        <span className="text-red-600 text-sm">
          Minimum bounty is $3, anything less will get eaten by fees.
        </span>
      ) : null}
    </div>
  )
}
