import { useEffect, useMemo, useState } from "react"
import octokit from "@/lib/github"
import { useRouter } from "next/router"
import { Input } from "@/ui/input"
import { loadStripe } from "@stripe/stripe-js"
import { Button } from "@/ui/button"
import { trpc } from "@/utils/trpc"
import {
  addDays,
  differenceInCalendarDays,
  format,
  formatDistanceToNow,
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
  const [endDate] = useState(addDays(startDate, 30))
  const chartData = useMemo(
    () => generateChartData(donations, startDate, endDate),
    [JSON.stringify(donations), startDate, endDate]
  )

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={chartData}>
        <XAxis
          dataKey="date"
          style={{ fontFamily: "monospace", fontSize: "12px" }}
          tickFormatter={(date: Date) => format(date, "MMM d")}
          axisLine={false}
          tickMargin={10}
          tickLine={false}
          minTickGap={50}
        />
        <YAxis
          style={{ fontFamily: "monospace", fontSize: "12px" }}
          tickFormatter={(value) => `$${value / 100}`}
          axisLine={false}
          tickLine={false}
          tickMargin={5}
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
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default function Page() {
  const router = useRouter()
  const { org, repo, issue } = router.query

  const [resp, setResp] = useState<
    Awaited<ReturnType<typeof octokit.issues.get>>["data"] | null
  >(null)

  useEffect(() => {
    if (!org || !repo || !issue) return

    octokit.issues
      .get({
        owner: org as string,
        repo: repo as string,
        issue_number: Number(issue),
      })
      .then((response) => {
        setResp(response.data)
      })
  }, [org, repo, issue])

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

  return (
    <div className="container mx-auto p-6">
      <header className="flex items-center justify-center relative">
        <div
          className="flex items-center justify-center"
          style={{
            height: "100%",
            position: "absolute",
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
        </div>

        <a
          className=""
          href={resp?.html_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="min-w-72 border px-3 py-2 rounded">
            {resp?.html_url}
          </div>
        </a>
      </header>

      {resp ? (
        <main className="mt-8 grid grid-cols-2 gap-4">
          <div>
            <div className="flex gap-3 items-start flex-col">
              <h1 className="text-2xl font-medium">
                {org}/{repo}#{issue}
              </h1>
              <h2 className="text-lg text-gray-500 line-clamp-1">
                {resp?.title}
              </h2>

              <div className="flex gap-4 items-center text-sm">
                <div className="bg-green-700 rounded-full text-white px-4 py-1 font-medium inline-block">
                  Open
                </div>
                <div className="text-gray-500 text-sm">
                  issue opened{" "}
                  {formatDistanceToNow(new Date(resp?.created_at!))} ago
                </div>
                <div className="text-gray-500">bit started some time ago</div>
              </div>
            </div>

            <div className="mt-8">
              <div className="text-lg font-medium mb-3">Current payout</div>
              <div className="text-4xl font-bold">
                ${(chartQuery.data?.totalInCents! / 100).toFixed(2)}
              </div>
              <div className="text-sm text-gray-800 mt-2">
                ~${((chartQuery.data?.totalInCents! / 100) * 0.95).toFixed(2)}{" "}
                after transaction fees
              </div>
            </div>

            <form action="/api/checkout" method="POST" className="mt-8">
              <input type="hidden" name="org" value={org} />
              <input type="hidden" name="repo" value={repo} />
              <input type="hidden" name="issue" value={issue} />
              <div className="flex gap-4 items-center">
                $
                <Input
                  type="number"
                  className="w-[160px]"
                  placeholder="0"
                  name="amount"
                />
                <div>Expires in</div>
                <select name="expiresIn">
                  <option value="one_week">1 week</option>
                  <option value="two_weeks">2 weeks</option>
                  <option value="one_month">1 month</option>
                  <option value="three_months">3 months</option>
                  <option value="six_months">6 months</option>
                  <option value="never">Never</option>
                </select>
                <Button type="submit">Contribute</Button>
              </div>
            </form>
          </div>

          <div>
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
        </main>
      ) : null}
    </div>
  )
}
