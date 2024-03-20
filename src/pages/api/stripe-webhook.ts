import { stripe } from "@/lib/stripe"
import { buffer } from "micro"
import { db, schema } from "@/db"
import Stripe from "stripe"
import { eq } from "drizzle-orm"
import { NextApiRequest, NextApiResponse } from "next"

export const config = {
  api: {
    bodyParser: false,
  },
}

const stripeWebhookHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" })
  }

  const payload = await buffer(req)
  let event: Stripe.Event

  const signature = req.headers["stripe-signature"]
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature as string,
      process.env.STRIPE_WEBHOOK_SECRET as string
    )
  } catch (err: any) {
    console.log(`⚠️  Webhook signature verification failed.`, err.message)
    return res
      .status(400)
      .json({ error: "Webhook signature verification failed" })
  }

  switch (event.type) {
    case "charge.succeeded":
      // Update the charge status to succeeded and note the net and fee amounts
      const stripeCharge = event.data.object as Stripe.Charge

      const balanceTx = await stripe.balanceTransactions.retrieve(
        stripeCharge.balance_transaction as string
      )

      if (balanceTx.currency !== "usd") {
        throw new Error(
          `Expected balance transaction currency to be USD, but got ${balanceTx.currency}. (${stripeCharge.id})`
        )
      }

      await db
        .update(schema.contribution)
        .set({
          successfulStripeChargeId: stripeCharge.id as string,
          netAmount: balanceTx.net,
          feeAmount: balanceTx.fee,
        })
        .where(
          eq(
            schema.contribution.stripePaymentIntentId,
            stripeCharge.payment_intent as string
          )
        )
      break

    case "checkout.session.completed":
      const stripeSession = event.data.object as Stripe.Checkout.Session

      await db
        .insert(schema.contribution)
        .values({
          stripeCheckoutSessionId: stripeSession.id,
          stripePaymentIntentId: stripeSession.payment_intent as string,
        })
        .onConflictDoUpdate({
          target: schema.contribution.stripeCheckoutSessionId,
          set: {
            stripePaymentIntentId: stripeSession.payment_intent as string,
          },
        })

      break

    default:
      // console.log(`🤷‍♀️ Unhandled event type ${event.type}`)
      break
  }

  return res.status(200).json({ ok: true })
}

export default stripeWebhookHandler
