import { stripe } from "@/lib/stripe"
import { getOrCreateBounty } from "@/server/utils/getOrCreateBounty"
import { NextApiRequest, NextApiResponse } from "next"
import { z } from "zod"

const dataSchema = z.object({
  org: z.string(),
  repo: z.string(),
  id: z.number(),
  amount: z.number(),
  expiresIn: z.enum([
    "one_week",
    "one_month",
    "three_months",
    "six_months",
    "never",
  ]),
})

const EXPIRY_MAP = {
  one_week: "1 week",
  one_month: "1 month",
  three_months: "3 months",
  six_months: "6 months",
  never: "never",
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const parsed = dataSchema.safeParse(req.body)

  if (!parsed.success) {
    res.status(400).json("Invalid input")
    return
  }

  if (req.method !== "POST") {
    res.status(405).json("Method Not Allowed")
    return
  }

  const dbProduct = await getOrCreateBounty(parsed.data)

  try {
    // Create Checkout Sessions from body params.
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product: dbProduct.stripeProductId,
            unit_amount: parsed.data.amount * 100,
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
                  EXPIRY_MAP[parsed.data.expiresIn]
                }, the funds will be returned to you.`,
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_URL}/bit/${parsed.data.org}/${parsed.data.repo}/${parsed.data.id}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/bit/${parsed.data.org}/${parsed.data.repo}/${parsed.data.id}?canceled=true`,
    })
    res.redirect(303, session.url as string)
  } catch (err: any) {
    res.status(err.statusCode || 500).json(err.message)
  }
}
