import { differenceInDays } from "date-fns"
import { and, asc, eq, gt, isNotNull, isNull, or } from "drizzle-orm"
import { NextApiRequest, NextApiResponse } from "next"

import { db, schema } from "@/db"
import { contribsToChart } from "@/utils/contribsToChart"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { org, repo, issue } = req.query

  const DAYS = 24
  const contribs = await db
    .select({
      amount: schema.contribution.amount,
      expiresAt: schema.contribution.expiresAt,
    })
    .from(schema.contribution)
    .innerJoin(
      schema.bountyIssue,
      eq(schema.contribution.bountyIssueId, schema.bountyIssue.id)
    )
    .where(
      and(
        isNotNull(schema.contribution.successfulStripeChargeId),
        eq(schema.bountyIssue.org, org as string),
        eq(schema.bountyIssue.repo, repo as string),
        eq(schema.bountyIssue.issue, parseInt(issue as string)),
        or(
          isNull(schema.contribution.expiresAt),
          gt(schema.contribution.expiresAt, new Date())
        )
      )
    )
    .orderBy(asc(schema.contribution.expiresAt))
  const data = contribsToChart(contribs, DAYS)

  res.status(200).json({
    days: DAYS,
    data,
    currentTotal: data[0],
    changesIn: contribs[0]?.expiresAt
      ? differenceInDays(contribs[0].expiresAt, new Date())
      : null,
  })
}
