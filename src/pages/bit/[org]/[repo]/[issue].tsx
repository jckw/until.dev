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
  isAfter,
  isBefore,
  startOfDay,
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

  console.log(chartData)

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={chartData}>
        <XAxis dataKey="date" />
        <YAxis tickFormatter={(value) => `$${(value / 100).toFixed(2)}`} />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip
          formatter={(value: number) => [
            `$${(value / 100).toFixed(2)}`,
            "Amount",
          ]}
        />
        <Area
          type="monotone"
          dataKey="amount"
          stroke="#8884d8"
          fill="#8884d8"
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
    <main className="max-w-3xl mx-auto p-8 space-y-8 bg-white rounded-lg shadow-md m-8">
      <a
        href={resp?.html_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600"
      >
        {org}/{repo}#{issue}
      </a>
      <h1 className="text-4xl font-bold">{resp?.title}</h1>
      <p>Contribute to the bounty</p>

      {chartQuery.data ? (
        <DonationChart
          donations={
            chartQuery.data.contributions.filter(
              (c) => !!c.amount
            ) as Donation[]
          }
        />
      ) : null}
      {resp ? (
        <form action="/api/checkout" method="POST">
          <input type="hidden" name="org" value={org} />
          <input type="hidden" name="repo" value={repo} />
          <input type="hidden" name="issue" value={issue} />
          <div className="flex gap-4 items-center">
            $
            <Input
              type="number"
              className="w-[180px]"
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
      ) : (
        <p>Loading...</p>
      )}
    </main>
  )
}
