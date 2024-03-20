import { stripe } from "@/lib/stripe"
import { getOrCreateBounty } from "@/server/utils/getOrCreateBounty"
import { NextApiRequest, NextApiResponse } from "next"
import { z } from "zod"
import { db, schema } from "@/db"
import { Duration, add } from "date-fns"

const dataSchema = z.object({
  org: z.string(),
  repo: z.string(),
  issue: z.coerce.number(),
  amount: z.coerce.number(),
  expiresIn: z.enum([
    "one_week",
    "two_weeks",
    "one_month",
    "three_months",
    "six_months",
    "never",
  ]),
})

const EXPIRY_MAP: Record<string, { text: string; add: Duration | null }> = {
  one_week: {
    text: "1 week",
    add: { weeks: 1 },
  },
  two_weeks: {
    text: "2 weeks",
    add: { weeks: 2 },
  },
  one_month: {
    text: "1 month",
    add: { months: 1 },
  },
  three_months: {
    text: "3 months",
    add: { months: 3 },
  },
  six_months: {
    text: "6 months",
    add: { months: 6 },
  },
  never: {
    text: "never",
    add: null,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const parsed = dataSchema.safeParse(req.body)

  if (!parsed.success) {
    res.status(400).json(parsed.error)
    return
  }

  if (req.method !== "POST") {
    res.status(405).json("Method Not Allowed")
    return
  }

  const centAmount = parsed.data.amount * 100
  const dbBountyProduct = await getOrCreateBounty(parsed.data)

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product: dbBountyProduct.stripeProductId,
            unit_amount: centAmount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      custom_text: {
        submit: {
          message:
            parsed.data.expiresIn === "never"
              ? "Your donation will only be refunded if the repo owner cancels the bounty."
              : `If this issue isn't resolved in the next ${
                  EXPIRY_MAP[parsed.data.expiresIn]["text"]
                }, the funds will be returned to you.`,
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_URL}/bit/${parsed.data.org}/${parsed.data.repo}/${parsed.data.issue}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/bit/${parsed.data.org}/${parsed.data.repo}/${parsed.data.issue}?canceled=true`,
    })

    const expiresAt = EXPIRY_MAP[parsed.data.expiresIn]["add"]
      ? add(new Date(), EXPIRY_MAP[parsed.data.expiresIn]["add"]!)
      : null

    await db
      .insert(schema.checkoutSession)
      .values({
        stripeCheckoutSessionId: session.id,

        bountyIssueId: dbBountyProduct.id,
        amount: centAmount,
        expiresAt: expiresAt,
      })
      .onConflictDoUpdate({
        // Assume the webhook has beaten us to the punch, so don't overwrite the status
        target: schema.checkoutSession.stripeCheckoutSessionId,
        set: {
          bountyIssueId: dbBountyProduct.id,
          amount: centAmount,
          expiresAt: expiresAt,
        },
      })

    res.redirect(303, session.url as string)
  } catch (err: any) {
    res.status(err.statusCode || 500).json(err.message)
  }
}
