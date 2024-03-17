import { useMemo, useState } from "react"
import {
  add,
  addDays,
  differenceInCalendarDays,
  format,
  formatDistanceStrict,
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
import { cn } from "@/utils"

export interface Donation {
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

export const Chart: React.FC<DonationChartProps> = ({ donations }) => {
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

export const BountyChart = ({
  contributions,
  className,
}: {
  contributions: Donation[]
  className?: string
}) => {
  return (
    <div className={cn("", className)}>
      <div className="text-lg font-medium mb-2">Payout timeline</div>
      <div className="ml-[-16px]">
        <Chart donations={contributions.filter((c) => !!c.amount)} />
      </div>
    </div>
  )
}
