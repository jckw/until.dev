import { z } from "zod"
import { procedure, router } from "../trpc"
import { db, schema } from "@/db"
import {
  and,
  count,
  desc,
  eq,
  gt,
  isNotNull,
  isNull,
  max,
  or,
  sum,
} from "drizzle-orm"
import { takeUniqueOrNull, takeUniqueOrThrow } from "@/db/utils"
import { github } from "@/lib/github"
import { sub } from "date-fns"

// Filter contributions for those where the payment was successfully charged, or the
// charge is still unsuccessful and the contribution was created within the last 15
// minutes
const contributionIsProbablyAvailable = and(
  isNotNull(schema.contribution.stripePaymentIntentId),
  or(
    isNotNull(schema.contribution.successfulStripeChargeId),
    and(
      gt(schema.contribution.createdAt, sub(new Date(), { minutes: 15 })),
      isNull(schema.contribution.successfulStripeChargeId)
    )
  ),
  or(
    gt(schema.contribution.expiresAt, new Date()),
    isNull(schema.contribution.expiresAt)
  )
)

export const appRouter = router({
  getFeaturedBounties: procedure.query(async () => {
    const bounties = await db
      .select({
        bountyIssueId: schema.bountyIssue.id,
        org: schema.bountyIssue.org,
        repo: schema.bountyIssue.repo,
        issue: schema.bountyIssue.issue,
        total: sum(schema.contribution.amount).mapWith(Number),
        contributors: count(schema.contribution.id),
      })
      .from(schema.bountyIssue)
      .leftJoin(
        schema.contribution,
        eq(schema.bountyIssue.id, schema.contribution.bountyIssueId)
      )
      .where(and(contributionIsProbablyAvailable))
      .groupBy(schema.bountyIssue.id)
      .orderBy(desc(max(schema.contribution.createdAt)))
      .limit(10)

    return bounties
  }),

  getIssueMeta: procedure
    .input(
      z.object({
        org: z.string(),
        repo: z.string(),
        issue: z.number(),
      })
    )
    .query(async (opts) => {
      let issueRes
      try {
        issueRes = await github.issues.get({
          owner: opts.input.org,
          repo: opts.input.repo,
          issue_number: opts.input.issue,
        })
      } catch (error: any) {
        if (error.status === 404) {
          return {
            issue: null,
            bounty: null,
          }
        }
        throw error
      }

      const bounty = await db
        .select({
          status: schema.bountyIssue.bountyStatus,
        })
        .from(schema.bountyIssue)
        .where(
          and(
            eq(schema.bountyIssue.org, opts.input.org),
            eq(schema.bountyIssue.repo, opts.input.repo),
            eq(schema.bountyIssue.issue, opts.input.issue)
          )
        )
        .then(takeUniqueOrThrow)

      return {
        issue: issueRes.data,
        bounty,
      }
    }),

  getBountyChart: procedure
    .input(
      z.object({
        org: z.string(),
        repo: z.string(),
        issue: z.number(),
      })
    )
    .query(async (opts) => {
      const bounty = await db
        .select()
        .from(schema.bountyIssue)
        .where(
          and(
            eq(schema.bountyIssue.org, opts.input.org),
            eq(schema.bountyIssue.repo, opts.input.repo),
            eq(schema.bountyIssue.issue, opts.input.issue)
          )
        )
        .then(takeUniqueOrNull)

      if (!bounty) {
        return {
          contributions: [],
          amount: {
            total: 0,
            availableTotal: 0,
          },
        }
      }

      const successfullyChargedContributions = await db
        .select({
          amount: schema.contribution.amount,
          expiresAt: schema.contribution.expiresAt,
        })
        .from(schema.contribution)
        .where(
          and(
            eq(schema.contribution.bountyIssueId, bounty.id),
            contributionIsProbablyAvailable
          )
        )

      const amount = await db
        .select({
          total: sum(schema.contribution.amount).mapWith(Number),
          availableTotal: sum(schema.contribution.netAmount).mapWith(Number), // i.e. the successfully charged net amount
        })
        .from(schema.contribution)
        .where(
          and(
            eq(schema.contribution.bountyIssueId, bounty.id),
            contributionIsProbablyAvailable
          )
        )
        .then(takeUniqueOrNull)

      return {
        contributions: successfullyChargedContributions,
        amount: {
          total: amount?.total ?? 0,
          availableTotal: amount?.availableTotal ?? 0,
        },
      }
    }),
})

export type AppRouter = typeof appRouter
