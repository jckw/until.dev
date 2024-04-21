import { Duration, sub } from "date-fns"
import { and, eq, isNotNull, lt } from "drizzle-orm"
import chunk from "lodash/chunk"

import { db, schema } from "@/db"
import { stripe } from "@/lib/stripe"

const GRACE_PERIOD: Duration = { hours: 4 }

import { eventTrigger, intervalTrigger } from "@trigger.dev/sdk"
import { z } from "zod"

import { client } from "@/trigger"

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
          amountToRefund: z.number(),
        })
      ),
    }),
  }),
  run: async (payload, io, _ctx) => {
    for (const payment of payload.paymentsToRefund) {
      await io.runTask(
        `refund-payment-${payment.paymentIntentId}`,
        async () => {
          await stripe.refunds.create({
            payment_intent: payment.paymentIntentId,
            amount: payment.amountToRefund,
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
  run: async (payload, io, _ctx) => {
    const result = await io.runTask("get-issues", async () => {
      const paymentsToRefund = await db
        .select({
          paymentIntentId: schema.contribution.stripePaymentIntentId,
          amountToRefund: schema.contribution.netAmount,
        })
        .from(schema.contribution)
        .leftJoin(
          schema.bountyIssue,
          eq(schema.contribution.bountyIssueId, schema.bountyIssue.id)
        )
        .where(
          and(
            eq(schema.bountyIssue.bountyStatus, "open"),
            lt(schema.contribution.expiresAt, sub(new Date(), GRACE_PERIOD)),
            isNotNull(schema.contribution.successfulStripeChargeId),
            isNotNull(schema.contribution.stripePaymentIntentId)
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
        paymentsToRefund: batch as {
          paymentIntentId: string
          amountToRefund: number
        }[],
      })
    }
  },
})
