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
import { useState } from "react"

interface ContributeFormProps {
  org: string
  repo: string
  issue: number
  bountyExists: boolean
  className?: string
}

const expiryOptions: Record<string, string> = {
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
  className,
}: ContributeFormProps) => {
  const [inputAmount, setInputAmount] = useState("10")
  const [inputExpiresIn, setInputExpiresIn] = useState("one_month")

  return (
    <div
      className={cn(
        "border p-5 gap-3 flex flex-col bg-black rounded-md text-white ",
        className
      )}
    >
      <form
        action="/api/checkout"
        method="POST"
        className="gap-3 flex flex-col"
      >
        <input type="hidden" name="org" value={org} />
        <input type="hidden" name="repo" value={repo} />

        <input type="hidden" name="issue" value={issue} />

        <div className="flex gap-[4px] items-center flex-wrap whitespace-break-spaces">
          <div>{bountyExists ? "I’ll contribute" : "Create bounty worth"}</div>

          <label
            className="border-b-white border-b flex items-center gap-1 text-xl font-medium mx-2"
            htmlFor="amount"
          >
            <span className="">$</span>
            <input
              name="amount"
              type="string"
              placeholder="0"
              defaultValue={inputAmount}
              onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                e.target.style.width = `${Math.max(e.target.value.length, 2)}ch`
              }}
              onChange={(e) => setInputAmount(e.target.value)}
              style={{ width: "2ch" }}
              className="bg-transparent focus:outline-none"
            />
          </label>

          {"if this issue is solved within".split(" ").map((word, i) => (
            <span key={i} className="whitespace-nowrap">
              {word}
            </span>
          ))}

          <Select
            name="expiresIn"
            defaultValue={inputExpiresIn}
            onValueChange={setInputExpiresIn}
          >
            <SelectTrigger
              aria-label="Expires in"
              className="border-0 p-0 text-xl font-medium border-b-white border-b rounded-none w-32 mx-2"
            >
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
                <SelectItem value="never">Never</SelectItem>
              </SelectGroup>
              <SelectScrollDownButton />
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          className="bg-white text-gray-900 px-5 py-7 text-md hover:bg-gray-100"
        >
          <span className="hidden md:inline">
            {bountyExists ? "Contribute" : "Create bounty for"} ${inputAmount}{" "}
            auto-refunding in {expiryOptions[inputExpiresIn]}
          </span>
          <span className="md:hidden">Contribute ${inputAmount}</span>
        </Button>
        <div className="text-sm text-gray-200 md:hidden">
          You will be auto-refunded if the issue is not solved in{" "}
          <span className="font-medium">{expiryOptions[inputExpiresIn]}</span>
        </div>
      </form>
    </div>
  )
}
