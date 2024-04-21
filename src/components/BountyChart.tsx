import { useMemo, useState } from "react"
import {
  addDays,
  addWeeks,
  differenceInCalendarDays,
  format,
  isAfter,
} from "date-fns"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts"

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

export interface Donation {
  amount: number
  expiresAt: Date | null
}

interface ChartData {
  unit: number
  amount: number
}
const generateChartData = (
  donations: Donation[],
  startDate: Date,
  endDate: Date,
  interval: "days" | "weeks" = "days"
): ChartData[] => {
  const baseAmount = donations
    .filter((d) => d.expiresAt === null)
    .reduce((acc, d) => acc + d.amount, 0)

  const intervalDifference =
    interval === "days"
      ? differenceInCalendarDays(endDate, startDate) + 1
      : Math.ceil(differenceInCalendarDays(endDate, startDate) / 7) + 1

  const chartData: ChartData[] = Array.from({ length: intervalDifference }).map(
    (_, index) => {
      const currentDate =
        interval === "days"
          ? addDays(startDate, index)
          : addDays(startDate, index * 7)
      const intervalAmount = donations
        .filter((d) => d.expiresAt && isAfter(d.expiresAt, currentDate))
        .reduce((acc, d) => acc + d.amount, 0)
      const currentAmount = baseAmount + intervalAmount

      return { unit: index, amount: currentAmount }
    }
  )

  return chartData
}

interface DonationChartProps {
  donations: Donation[]
  height?: number
}

const BarWithBorder = ({ x, y, width, height }: any) => {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        stroke="none"
        fill="#E3F5E9"
      />
      <rect x={x} y={y} width={width} height={3} stroke="none" fill="#3AAD64" />
    </g>
  )
}

export const Chart: React.FC<DonationChartProps> = ({ donations, height }) => {
  const [startDate] = useState(new Date())
  const [endDate] = useState(addDays(startDate, 60))
  const [unit, setUnit] = useState<"days" | "weeks">("days")

  const chartData = useMemo(
    () => generateChartData(donations, startDate, endDate, unit),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(donations), startDate, endDate, unit]
  )

  return (
    <div>
      <Select
        name="unit"
        defaultValue={unit}
        onValueChange={(v) => setUnit(v as "days" | "weeks")}
      >
        <SelectTrigger
          aria-label="View"
          className="w-auto mx-2 my-2 border-0 p-0 text-gray-700 focus:ring-0 focus:outline-none focus:text-gray-900 m-0"
        >
          <SelectValue placeholder="Select view" />
        </SelectTrigger>
        <SelectContent>
          <SelectScrollUpButton />
          <SelectGroup>
            <SelectItem value="days">Day view</SelectItem>
            <SelectItem value="weeks">Week view</SelectItem>
          </SelectGroup>
          <SelectScrollDownButton />
        </SelectContent>
      </Select>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData.slice(0, 25)} barCategoryGap={2}>
          <XAxis
            dataKey="unit"
            style={{ fontFamily: "monospace", fontSize: 10, color: "#A2AAB8" }}
            tickLine={false}
            axisLine={false}
            interval={0}
            tickMargin={6}
          />
          <Tooltip
            labelFormatter={(value) =>
              `Solved within ${value} ${unit}, by ${format(
                unit === "days"
                  ? addDays(startDate, value)
                  : addWeeks(startDate, value),
                "MMMM d yyyy"
              )}`
            }
            formatter={(value) => [
              `$${(Number(value) / 100).toFixed(2)}`,
              "Reward",
            ]}
          />
          <Bar dataKey="amount" shape={BarWithBorder} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
