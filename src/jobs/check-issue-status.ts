import { db, schema } from "@/db"
import { github } from "@/lib/github"
import { client } from "@/trigger"
import { eventTrigger, intervalTrigger } from "@trigger.dev/sdk"
import { and, eq } from "drizzle-orm"
import { z } from "zod"
import { resend } from "./integrations"

const issueStatusChecker = client.defineJob({
  id: "issue-status-checker-agent",
  name: "Issue status checker agent",
  version: "0.0.1",
  trigger: eventTrigger({
    name: "bounty.issue-status-checked",
    schema: z.object({
      org: z.string(),
      repo: z.string(),
      issue: z.number(),
    }),
  }),
  integrations: {
    resend,
  },
  run: async (payload, io, ctx) => {
    const issue = await github.issues.get({
      owner: payload.org,
      repo: payload.repo,
      issue_number: payload.issue,
    })

    if (!issue.data.closed_at) {
      return
    }

    await io.runTask("update-bounty-status", async () => {
      await db
        .update(schema.bountyIssue)
        .set({ bountyStatus: "paused", pausedAt: new Date() })
        .where(
          and(
            eq(schema.bountyIssue.org, payload.org),
            eq(schema.bountyIssue.repo, payload.repo),
            eq(schema.bountyIssue.issue, payload.issue)
          )
        )
    })

    io.resend.emails.send(
      `bounty-issue-closed-email-${payload.org}-${payload.repo}-${payload.issue}`,
      {
        from: "fundbit@apps.weekend.systems",
        to: "jackweatherilt@outlook.com",
        subject: "Bounty issue closed",
        text: `The issue ${payload.org}/${payload.repo}#${payload.issue} has been closed and the bounty has been paused. Please look into it and update the bounty status accordingly.`,
      }
    )
  },
})

client.defineJob({
  id: "check-issue-status-scheduler",
  name: "Check issue status scheduler",
  version: "0.0.1",
  trigger: intervalTrigger({
    seconds: 60 * 60,
  }),
  run: async (payload, io, ctx) => {
    const result = await io.runTask("get-issues", async () => {
      const openIssues = await db
        .select()
        .from(schema.bountyIssue)
        .where(eq(schema.bountyIssue.bountyStatus, "open"))
      return openIssues
    })

    for (const issue of result) {
      await issueStatusChecker.invoke(`issue-status-checker-${issue.id}`, {
        org: issue.org,
        repo: issue.repo,
        issue: issue.issue,
      })
    }
  },
})
