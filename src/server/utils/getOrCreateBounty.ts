import { db, schema } from "@/db"
import { takeUniqueOrNull, takeUniqueOrThrow } from "@/db/utils"
import { stripe } from "@/lib/stripe"
import { and, eq } from "drizzle-orm"

type BountyData = {
  org: string
  repo: string
  id: number
}

export const getOrCreateBounty = async (bountyData: BountyData) => {
  let dbProduct = await db
    .select()
    .from(schema.bountyIssue)
    .where(
      and(
        eq(schema.bountyIssue.org, bountyData.org),
        eq(schema.bountyIssue.repo, bountyData.repo),
        eq(schema.bountyIssue.issue, bountyData.id)
      )
    )
    .then(takeUniqueOrNull)

  if (!dbProduct) {
    const stripeProduct = await stripe.products.create({
      name: `Bounty contribution for ${bountyData.org}/${bountyData.repo}#${bountyData.id}`,
      description: `A donation to the bounty for the issue at github.com/${bountyData.org}/${bountyData.repo}/issues/${bountyData.id}`,
    })
    dbProduct = await db
      .insert(schema.bountyIssue)
      .values({
        org: bountyData.org,
        repo: bountyData.repo,
        issue: bountyData.id,
        stripeProductId: stripeProduct.id,
      })
      .returning()
      .then(takeUniqueOrThrow)
    // Dummy check to satisfy TypeScript
    if (!dbProduct) {
      throw new Error("Failed to create bounty issue")
    }
  }
  return dbProduct
}
