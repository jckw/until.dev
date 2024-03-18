import { z } from "zod"
import { procedure, router } from "../trpc"
import { db, schema } from "@/db"
import { and, count, eq, gt, isNull, or, sum } from "drizzle-orm"
import { takeUniqueOrNull } from "@/db/utils"
import { github } from "@/lib/github"

export const appRouter = router({
  getFeaturedBounties: procedure.query(async () => {
    const bounties = await db
      .select({
        bountyIssueId: schema.bountyIssue.id,
        org: schema.bountyIssue.org,
        repo: schema.bountyIssue.repo,
        issue: schema.bountyIssue.issue,
        total: sum(schema.checkoutSession.amount).mapWith(Number),
        contributors: count(schema.checkoutSession.id),
      })
      .from(schema.bountyIssue)
      .leftJoin(
        schema.checkoutSession,
        eq(schema.bountyIssue.id, schema.checkoutSession.bountyIssueId)
      )
      .where(
        and(
          eq(schema.bountyIssue.bountyStatus, "open"),
          eq(schema.checkoutSession.status, "complete"),
          or(
            gt(schema.checkoutSession.expiresAt, new Date()),
            isNull(schema.checkoutSession.expiresAt)
          )
        )
      )
      .groupBy(schema.bountyIssue.id)
      .orderBy(sum(schema.checkoutSession.id))
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
      const issueRes = await github.issues.get({
        owner: opts.input.org,
        repo: opts.input.repo,
        issue_number: opts.input.issue,
      })

      const bountyExists = await db
        .select()
        .from(schema.bountyIssue)
        .where(
          and(
            eq(schema.bountyIssue.org, opts.input.org),
            eq(schema.bountyIssue.repo, opts.input.repo),
            eq(schema.bountyIssue.issue, opts.input.issue)
          )
        )
        .then((res) => res.length > 0)

      return {
        issue: issueRes.data,
        bountyExists,
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
          totalInCents: 0,
        }
      }

      const successfulCheckouts = await db
        .select({
          amount: schema.checkoutSession.amount,
          expiresAt: schema.checkoutSession.expiresAt,
        })
        .from(schema.checkoutSession)
        .where(
          and(
            gt(schema.checkoutSession.expiresAt, new Date()),
            eq(schema.checkoutSession.bountyIssueId, bounty.id),
            eq(schema.checkoutSession.status, "complete")
          )
        )

      const sumAmount = await db
        .select({
          total: sum(schema.checkoutSession.amount).mapWith(Number),
        })
        .from(schema.checkoutSession)
        .where(
          and(
            gt(schema.checkoutSession.expiresAt, new Date()),
            eq(schema.checkoutSession.bountyIssueId, bounty.id),
            eq(schema.checkoutSession.status, "complete")
          )
        )
        .then(takeUniqueOrNull)

      return {
        contributions: successfulCheckouts,
        totalInCents: sumAmount?.total || 0,
      }
    }),
})

export type AppRouter = typeof appRouter
