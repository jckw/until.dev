import { z } from "zod"
import { procedure, router } from "../trpc"
import { db, schema } from "@/db"
import { and, eq, sum } from "drizzle-orm"
import { takeUniqueOrNull } from "@/db/utils"
import { github } from "@/lib/github"

export const appRouter = router({
  hello: procedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query((opts) => {
      return {
        greeting: `hello ${opts.input.text}`,
      }
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

      return issueRes.data
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
