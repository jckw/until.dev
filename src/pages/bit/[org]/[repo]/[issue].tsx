import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/router"
import { Input } from "@/ui/input"
import { loadStripe } from "@stripe/stripe-js"
import { Button } from "@/ui/button"
import { trpc } from "@/utils/trpc"
import {
  add,
  addDays,
  differenceInCalendarDays,
  format,
  formatDistanceStrict,
  formatDistanceToNowStrict,
  isAfter,
} from "date-fns"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
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
import Link from "next/link"
import { toast } from "sonner"

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
)

interface Donation {
  amount: number
  expiresAt: Date | null
}

interface ChartData {
  date: Date
  amount: number
}

const generateChartData = (
  donations: Donation[],
  startDate: Date,
  endDate: Date
): ChartData[] => {
  const baseAmount = donations
    .filter((d) => d.expiresAt === null)
    .reduce((acc, d) => acc + d.amount, 0)

  const daysDifference = differenceInCalendarDays(endDate, startDate) + 1
  const chartData: ChartData[] = Array.from({ length: daysDifference }).map(
    (_, index) => {
      const currentDate = addDays(startDate, index)
      const dailyAmount = donations
        .filter((d) => d.expiresAt && isAfter(d.expiresAt, currentDate))
        .reduce((acc, d) => acc + d.amount, 0)
      const currentAmount = baseAmount + dailyAmount

      return { date: currentDate, amount: currentAmount }
    }
  )

  return chartData
}

interface DonationChartProps {
  donations: Donation[]
}
const DonationChart: React.FC<DonationChartProps> = ({ donations }) => {
  const [startDate] = useState(new Date())
  const [endDate] = useState(addDays(startDate, 60))
  const chartData = useMemo(
    () => generateChartData(donations, startDate, endDate),
    [JSON.stringify(donations), startDate, endDate]
  )

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={chartData}>
        <XAxis
          dataKey="date"
          style={{ fontFamily: "monospace", fontSize: "12px" }}
          tickFormatter={(date: Date) => formatDistanceStrict(date, startDate)}
          axisLine={false}
          tickMargin={16}
          tickLine={false}
          ticks={
            [{ weeks: 1 }, { weeks: 2 }, { months: 1 }, { months: 2 }].map(
              (duration) => add(startDate, duration)
            ) as any
          }
        />
        <YAxis
          style={{ fontFamily: "monospace", fontSize: "12px" }}
          tickFormatter={(value, index) => (index > 0 ? `$${value / 100}` : "")}
          axisLine={false}
          tickLine={false}
          minTickGap={10}
          tickMargin={16}
        />
        <CartesianGrid vertical={false} horizontal={false} />
        <Tooltip
          labelFormatter={(date: Date) =>
            `Solved by: ${format(date, "d MMMM yyyy")}`
          }
          formatter={(value: number) => [
            `$${(value / 100).toFixed(2)}`,
            "Bounty awarded",
          ]}
        />
        <Area
          type="monotone"
          dataKey="amount"
          stroke="#FD766C"
          fill="#FEE4E1"
          strokeWidth={3}
          dot={(props: { index: number; cx: number; cy: number }) => {
            if (props.index === 0) {
              return (
                <circle
                  r={4}
                  fill="#FD766C"
                  // stroke="white"
                  strokeWidth={2}
                  cx={props.cx}
                  cy={props.cy}
                />
              )
            }
            return <></>
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

const AddCommentCTA = ({
  bountyTotalStr,
  bountyLevelExpiresAt,
}: {
  bountyTotalStr: string
  bountyLevelExpiresAt: Date
}) => {
  const withinMsg = bountyLevelExpiresAt
    ? ` within ${formatDistanceToNowStrict(
        bountyLevelExpiresAt
      )}, and decreases after that`
    : ""

  const message = `I just contributed to the bounty on this issue:

- ${process.env.NEXT_PUBLIC_URL}/bit/{org}/{repo}/{issue}

The current bounty for completing it is ${bountyTotalStr} if it is closed${withinMsg}.`

  return (
    <div
      className="mt-2 cursor-pointer"
      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
        navigator.clipboard.writeText(message)
        toast.success("Copied to clipboard")
      }}
    >
      <div className="text-xs font-bold text-green-300 text-center p-1 bg-green-800 rounded-t-md">
        CLICK TO COPY
      </div>
      <div className="text-sm block p-3 leading-relaxed whitespace-pre-wrap font-mono w-full bg-green-900 text-green-100 rounded-b-md">
        {message.split("\n").map((line, i) => (
          <p key={i} className="mb-2 last:mb-0">
            {line}
          </p>
        ))}
      </div>
    </div>
  )
}

export default function Page() {
  const router = useRouter()
  const { org, repo, issue } = router.query
  const success = router.query["success"] === "true"

  useEffect(() => {
    if (success) {
      toast.success("Your donation was successful!")
    }
  }, [success])

  // TODO: Clear query params
  const issueQuery = trpc.getIssueMeta.useQuery(
    {
      org: org as string,
      repo: repo as string,
      issue: Number(issue),
    },
    {
      enabled: Boolean(org && repo && issue),
    }
  )
  const chartQuery = trpc.getBountyChart.useQuery(
    {
      org: org as string,
      repo: repo as string,
      issue: Number(issue),
    },
    {
      enabled: Boolean(org && repo && issue),
    }
  )

  const [inputAmount, setInputAmount] = useState("10")
  const [inputExpiresIn, setInputExpiresIn] = useState("one_month")
  const copyTextRef = useRef<HTMLDivElement>(null)

  return (
    <div className="container mx-auto p-6">
      <header className="relative flex flex-col gap-4">
        <Link
          href="/"
          className="flex items-center justify-center md:absolute z-50"
          style={{
            height: "100%",
            top: "0",
            bottom: "0",
            left: "0",
          }}
        >
          <svg
            width="96"
            height="23"
            viewBox="0 0 96 23"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="19" height="19" rx="2" fill="#FD766C" />
            <rect x="1" y="1" width="5" height="5" rx="1.2" fill="white" />
            <rect x="7" y="7" width="5" height="5" rx="1.2" fill="white" />
            <rect x="13" y="13" width="5" height="5" rx="1.2" fill="white" />
            <rect x="7" y="13" width="5" height="5" rx="1.2" fill="white" />
            <rect x="1" y="13" width="5" height="5" rx="1.2" fill="white" />
            <rect x="1" y="7" width="5" height="5" rx="1.2" fill="white" />
            <path
              d="M25.872 4.856C25.872 2.384 26.592 0.92 29.568 0.92H30.048V2.792H29.568C28.344 2.792 27.984 3.32 27.984 4.856V6.2H30.168V8.072H27.984V17H25.872V8.072H24.504V6.2H25.872V4.856ZM41.6946 17H39.5826V15.68C38.8146 16.64 37.7346 17.24 36.3426 17.24C33.9186 17.24 31.8066 15.44 31.8066 12.416V6.2H33.9186V11.84C33.9186 14.168 35.0226 15.32 36.7266 15.32C38.4306 15.32 39.5826 14.168 39.5826 11.84V6.2H41.6946V17ZM43.9958 6.2H46.1078V7.52C46.8758 6.56 47.9558 5.96 49.3478 5.96C51.7718 5.96 53.8838 7.76 53.8838 10.784V17H51.7718V11.36C51.7718 9.032 50.6678 7.88 48.9638 7.88C47.2598 7.88 46.1078 9.032 46.1078 11.36V17H43.9958V6.2ZM64.3929 0.199999H66.5049V17H64.3929V15.584C63.6249 16.64 62.4729 17.24 60.9849 17.24C58.0809 17.24 55.7289 15.008 55.7289 11.6C55.7289 8.168 58.0809 5.96 60.9849 5.96C62.4729 5.96 63.6249 6.56 64.3929 7.592V0.199999ZM57.8889 11.6C57.8889 13.736 59.1369 15.32 61.2249 15.32C63.3129 15.32 64.5609 13.736 64.5609 11.6C64.5609 9.44 63.3129 7.88 61.2249 7.88C59.1369 7.88 57.8889 9.44 57.8889 11.6ZM70.9281 0.199999V7.592C71.6961 6.56 72.8481 5.96 74.3361 5.96C77.2401 5.96 79.5921 8.168 79.5921 11.6C79.5921 15.008 77.2401 17.24 74.3361 17.24C72.8481 17.24 71.6961 16.64 70.9281 15.584V17H68.8161V0.199999H70.9281ZM70.7601 11.6C70.7601 13.736 72.0081 15.32 74.0961 15.32C76.1841 15.32 77.4321 13.736 77.4321 11.6C77.4321 9.44 76.1841 7.88 74.0961 7.88C72.0081 7.88 70.7601 9.44 70.7601 11.6ZM82.9459 6.2H85.0579V9.488C85.0579 13.472 86.4499 14.84 87.6259 14.888V17C85.7539 16.952 84.5059 15.632 84.0019 13.88C83.4979 15.632 82.2259 16.952 80.3779 17V14.888C81.5299 14.84 82.9459 13.472 82.9459 9.488V6.2ZM82.5619 2.624C82.5619 1.832 83.1619 1.184 84.0019 1.184C84.8659 1.184 85.4659 1.832 85.4659 2.624C85.4659 3.44 84.8659 4.088 84.0019 4.088C83.1619 4.088 82.5619 3.44 82.5619 2.624ZM89.9021 2.792H92.0141V6.2H94.6301V8.072H92.0141V13.856C92.0141 14.552 92.2061 15.128 93.2621 15.128H94.8701V17H92.6861C90.7181 17 89.9021 16.016 89.9021 14.144V8.072H88.5341V6.2H89.9021V2.792Z"
              fill="black"
            />
          </svg>
        </Link>

        <div className="flex items-center justify-center relative">
          <Input
            className="max-w-96 text-center"
            defaultValue={issueQuery.data?.html_url}
          />
          <a
            href={issueQuery.data?.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 flex h-9 items-center justify-center rounded-md border border-input bg-transparent p-1 shadow-sm transition-colors   focus-visible:ring-1 focus-visible:ring-ring aspect-square hover:bg-gray-100 hover:cursor-pointer"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 9L21 3M21 3H15M21 3L13 11M10 5H7.8C6.11984 5 5.27976 5 4.63803 5.32698C4.07354 5.6146 3.6146 6.07354 3.32698 6.63803C3 7.27976 3 8.11984 3 9.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21H14.2C15.8802 21 16.7202 21 17.362 20.673C17.9265 20.3854 18.3854 19.9265 18.673 19.362C19 18.7202 19 17.8802 19 16.2V14"
                stroke="black"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </a>
        </div>
      </header>

      {issueQuery.data ? (
        <main className="mt-8 md:py-8 flex flex-col md:grid md:grid-cols-2 gap-8 md:gap-12 auto-rows-max md:items-start">
          <div className="flex gap-3 items-start flex-col row-start-1 col-start-1">
            <div className="flex gap-4 items-center text-sm">
              <div className="bg-green-700 rounded-full text-white px-4 py-1 font-medium inline-block">
                Open
              </div>
              <div className="text-gray-500 font-sm flex gap-4">
                <span>
                  issue{" "}
                  {formatDistanceToNowStrict(
                    new Date(issueQuery.data?.created_at!)
                  )}{" "}
                  old
                </span>
                <span>/</span>
                <span>bit not very old</span>
              </div>
            </div>
            <h1 className="text-2xl font-medium">
              Community-created bounty on closing {repo}#{issue}
            </h1>
            <h2 className="text-lg text-gray-500 line-clamp-1">
              {issueQuery.data?.title}
            </h2>

            <div className="flex gap-2 items-center">
              <svg
                width="16"
                height="15"
                viewBox="0 0 16 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M7.57551 0.0891418C3.38644 0.0891418 0 3.48578 0 7.68786C0 11.0469 2.16981 13.8901 5.17991 14.8965C5.55625 14.9721 5.6941 14.7329 5.6941 14.5318C5.6941 14.3556 5.68169 13.7518 5.68169 13.1227C3.57437 13.5756 3.13555 12.2168 3.13555 12.2168C2.79689 11.3362 2.2951 11.1098 2.2951 11.1098C1.60537 10.6443 2.34534 10.6443 2.34534 10.6443C3.11043 10.6947 3.51189 11.4243 3.51189 11.4243C4.18905 12.5817 5.28023 12.2547 5.71922 12.0533C5.78186 11.5627 5.98267 11.223 6.19589 11.0343C4.51515 10.8582 2.7468 10.204 2.7468 7.2852C2.7468 6.4549 3.04763 5.77557 3.52429 5.24724C3.44909 5.05857 3.18563 4.27842 3.59965 3.23427C3.59965 3.23427 4.23929 3.03294 5.68153 4.01426C6.29905 3.84793 6.93578 3.76331 7.57551 3.7626C8.21511 3.7626 8.86718 3.85076 9.46925 4.01426C10.9117 3.03294 11.5513 3.23427 11.5513 3.23427C11.9653 4.27842 11.7017 5.05857 11.6265 5.24724C12.1158 5.77557 12.4042 6.4549 12.4042 7.2852C12.4042 10.204 10.6358 10.8455 8.94251 11.0343C9.21851 11.2733 9.45671 11.7261 9.45671 12.4433C9.45671 13.4623 9.44431 14.2801 9.44431 14.5316C9.44431 14.7329 9.58231 14.9721 9.95851 14.8966C12.9686 13.89 15.1384 11.0469 15.1384 7.68786C15.1508 3.48578 11.752 0.0891418 7.57551 0.0891418Z"
                  fill="#171515"
                />
              </svg>
              <div className="flex gap-1 items-center font-mono text-sm text-gray-500">
                <span>{org}</span>
                <span>/</span>
                <span>{repo}</span>
                <span>#</span>
                <span>{issue}</span>
              </div>
            </div>
          </div>

          <div className="col-start-2 row-start-1 md:self-end">
            <div className="text-lg font-medium mb-3">Current payout</div>
            <div className="text-4xl font-bold">
              ${(chartQuery.data?.totalInCents! / 100).toFixed(2)}
            </div>
            <div className="text-sm text-gray-800 mt-2">
              ~${((chartQuery.data?.totalInCents! / 100) * 0.95).toFixed(2)}{" "}
              after transaction fees
            </div>
          </div>

          <div>
            <div className="text-lg font-medium mb-2">Payout timeline</div>
            <div className="ml-[-16px]">
              {chartQuery.data ? (
                <DonationChart
                  donations={
                    chartQuery.data.contributions.filter(
                      (c) => !!c.amount
                    ) as Donation[]
                  }
                />
              ) : null}
            </div>
          </div>

          <div className="row-start-2 col-start-1">
            {success ? (
              <div className="bg-green-100 border-green-300 border p-4 rounded-md text-green-800 font-medium mb-4 flex flex-col gap-2">
                <div>
                  Your donation was successful! Thank you for contributing to
                  this bounty.
                </div>
                <div>Please mention your contribution on the repo:</div>
                <AddCommentCTA
                  bountyTotalStr={`$${(
                    chartQuery.data?.totalInCents! / 100
                  ).toFixed(2)}`}
                  bountyLevelExpiresAt={chartQuery.data?.bountyLevelExpiresAt!}
                />
              </div>
            ) : null}

            <div className="border p-5 gap-3 flex flex-col bg-black rounded-md text-white ">
              <form
                action="/api/checkout"
                method="POST"
                className="gap-3 flex flex-col"
              >
                <input type="hidden" name="org" value={org} />
                <input type="hidden" name="repo" value={repo} />
                <input type="hidden" name="issue" value={issue} />
                <div className="flex gap-[4px] items-center flex-wrap whitespace-break-spaces">
                  <div>I’ll contribute</div>

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
                        e.target.style.width = `${Math.max(
                          e.target.value.length,
                          2
                        )}ch`
                      }}
                      onChange={(e) => setInputAmount(e.target.value)}
                      style={{ width: "2ch" }}
                      className="bg-transparent focus:outline-none"
                    />
                  </label>

                  {"if this issue is solved within"
                    .split(" ")
                    .map((word, i) => (
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
                    Contribute ${inputAmount} auto-refunding in{" "}
                    {inputExpiresIn === "one_week"
                      ? "1 week"
                      : inputExpiresIn === "two_weeks"
                      ? "2 weeks"
                      : inputExpiresIn === "one_month"
                      ? "1 month"
                      : inputExpiresIn === "three_months"
                      ? "3 months"
                      : inputExpiresIn === "six_months"
                      ? "6 months"
                      : "never"}
                  </span>
                  <span className="md:hidden">Contribute ${inputAmount}</span>
                </Button>
                <div className="text-sm text-gray-200 md:hidden">
                  You will be auto-refunded if the issue is not solved in{" "}
                  {inputExpiresIn === "one_week"
                    ? "1 week"
                    : inputExpiresIn === "two_weeks"
                    ? "2 weeks"
                    : inputExpiresIn === "one_month"
                    ? "1 month"
                    : inputExpiresIn === "three_months"
                    ? "3 months"
                    : inputExpiresIn === "six_months"
                    ? "6 months"
                    : "never"}
                </div>
              </form>
            </div>

            <div className="p-4 border rounded-md mt-4">
              <div className="flex gap-4 items-center">
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
                  If the{" "}
                  <span className="text-orange-600 font-mono">{org}</span>{" "}
                  closes issue{" "}
                  <span className="font-mono text-orange-600">#{issue}</span> in{" "}
                  <span className="font-mono text-orange-600">{repo}</span>,
                  they will be rewarded the bounty.
                </p>
                <p>
                  Contibute to the bounty to incentivize its prioritization. If
                  the issue is not solved by the expiry date you set, you will
                  be auto-refunded.
                </p>
              </div>
            </div>
          </div>
        </main>
      ) : null}
    </div>
  )
}
