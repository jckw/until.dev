import { differenceInDays } from "date-fns"

/**
 * Contributions to chart
 *
 * This function takes a number of contributions which have expiry dates (or not,
 * indicated by the `null` value) and returns a set of values for the total contribution
 * n days from now, starting with 0.
 *
 * e.g. if the contributions are:
 * - $50, expiring in 10 days,
 * - $20, expiring in 5 days,
 * - $30, expiring never
 *
 * then the function will return:
 * - [100, 100, 100, 100, 100, 80, 80, 80, 80, 80, 30, 30 ...]
 */
export const contribsToChart = (
  successfulContribs: { expiresAt: Date | null; amount: number | null }[],
  days: number
) => {
  const chart: number[] = Array(days).fill(0)
  const now = Date.now()

  for (const contrib of successfulContribs) {
    const days = contrib.expiresAt
      ? differenceInDays(contrib.expiresAt, now)
      : Infinity

    // Apply the contribution to the chart
    for (let i = 0; i < days && i < chart.length; i++) {
      chart[i] += contrib.amount ?? 0
    }
  }

  return chart
}
