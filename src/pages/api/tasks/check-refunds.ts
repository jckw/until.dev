import { NextApiRequest, NextApiResponse } from "next"
import { db, schema } from "@/db"
import { and, eq, lt } from "drizzle-orm"
import { Duration, add } from "date-fns"
import { stripe } from "@/lib/stripe"
import chunk from "lodash/chunk"

const GRACE_PERIOD: Duration = { hours: 4 }

const checkRefundsTask = async (req: NextApiRequest, res: NextApiResponse) => {
  // Look for bounties that have expired on issues that are not paused or closed
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

  const paymentBatches = chunk(paymentsToRefund, 10)

  for (const batch of paymentBatches) {
    await Promise.all(
      batch.map((payment) => {
        return stripe.refunds.create({
          payment_intent: payment.paymentIntentId,
        })
      })
    )
  }

  res.status(200).json({ ok: true, refunded: paymentsToRefund.length })
}

export default checkRefundsTask
