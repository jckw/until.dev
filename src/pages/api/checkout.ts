import { NextApiRequest, NextApiResponse } from "next"
import { z } from "zod"

import Stripe from "stripe"
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16",
})

const schema = z.object({
  org: z.string(),
  repo: z.string(),
  id: z.string(),
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
  const data = req.body

  if (!schema.safeParse(data)) {
    res.status(400).json("Invalid input")
    return
  }

  if (req.method !== "POST") {
    res.status(405).json("Method Not Allowed")
    return
  }

  // TODO: Get or create product from DB
  // product = await stripe.products.search({
  //   query: ``
  //   name: `Bounty contribution for ${data.org}/${data.repo}#${data.id}`,
  // })

  // if (product.data.length === 0) {
  // const product = await stripe.products.create({
  //   name: `Bounty contribution for ${data.org}/${data.repo}#${data.id}`,
  //   description: `A donation to the bounty for the issue at [github.com/${data.org}/${data.repo}/issues/${data.id}](https://github.com/${data.org}/${data.repo}/issues/${data.id})`,
  // })
  const product = {
    id: "prod_PhxSgwtyblb10T",
  }
  // }

  try {
    // Create Checkout Sessions from body params.
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product: product.id,
            unit_amount: data.amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      custom_text: {
        submit: {
          message:
            data.expiresIn === "never"
              ? "Your donation will only be refunded if the repo owner cancels the bounty."
              : `If this issue isn't resolved in the next ${
                  EXPIRY_MAP[data.expiresIn as keyof typeof EXPIRY_MAP]
                }, the funds will be returned to you.`,
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_URL}/bit/${data.org}/${data.repo}/${data.id}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/bit/${data.org}/${data.repo}/${data.id}?canceled=true`,
    })
    res.redirect(303, session.url as string)
  } catch (err: any) {
    res.status(err.statusCode || 500).json(err.message)
  }
}
