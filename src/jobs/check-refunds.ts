import { db, schema } from "@/db"
import { and, eq, lt } from "drizzle-orm"
import { Duration, add } from "date-fns"
import { stripe } from "@/lib/stripe"
import chunk from "lodash/chunk"

const GRACE_PERIOD: Duration = { hours: 4 }

import { eventTrigger, intervalTrigger } from "@trigger.dev/sdk"
import { client } from "@/trigger"
import { z } from "zod"

const batchRefunder = client.defineJob({
  id: "batch-refunder-agent",
  name: "Batch refunder agent",
  version: "0.0.1",
  trigger: eventTrigger({
    name: "bounty.refunded",
    schema: z.object({
      paymentsToRefund: z.array(
        z.object({
          paymentIntentId: z.string(),
        })
      ),
    }),
  }),
  run: async (payload, io, ctx) => {
    for (const payment of payload.paymentsToRefund) {
      await io.runTask(
        `refund-payment-${payment.paymentIntentId}`,
        async () => {
          await stripe.refunds.create({
            payment_intent: payment.paymentIntentId,
            // TODO: Only refund partial amount
          })
        }
      )
    }
  },
})

client.defineJob({
  id: "check-refunds-scheduler",
  name: "Check refunds scheduler",
  version: "0.0.1",
  trigger: intervalTrigger({
    seconds: 60 * 60,
  }),
  run: async (payload, io, ctx) => {
    const result = await io.runTask("get-issues", async () => {
      const paymentsToRefund = await db
        .select({
          paymentIntentId: schema.checkoutSession.stripePaymentIntentId,
        })
        .from(schema.checkoutSession)
        .leftJoin(
          schema.bountyIssue,
          eq(schema.checkoutSession.bountyIssueId, schema.bountyIssue.id)
        )
        .where(
          and(
            eq(schema.bountyIssue.bountyStatus, "open"),
            eq(schema.checkoutSession.status, "complete"),
            lt(schema.checkoutSession.expiresAt, add(new Date(), GRACE_PERIOD))
          )
        )

      return { paymentsToRefund }
    })

    // break into sub groups, totalling no more than 200 groups in total since we can
    // only run 200 tasks in a job
    const paymentBatches = chunk(
      result.paymentsToRefund,
      Math.ceil(result.paymentsToRefund.length / 200)
    )

    for (const batch of paymentBatches) {
      const cacheKey = `batch-refunder-${batch[0].paymentIntentId}-${
        batch[batch.length - 1].paymentIntentId
      }`

      await batchRefunder.invoke(cacheKey, {
        paymentsToRefund: batch as { paymentIntentId: string }[],
      })
    }
  },
})
