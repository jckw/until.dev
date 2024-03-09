import { relations } from "drizzle-orm"
import {
  integer,
  pgEnum,
  pgTable,
  serial,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core"
import Stripe from "stripe"

export const bountyStatusList = ["open", "paused"] as const
export type BountyStatus = (typeof bountyStatusList)[number]
export const bountyStatusEnum = pgEnum("bounty_status", bountyStatusList)

export const bountyIssue = pgTable(
  "bounty_issue",
  {
    id: serial("id").primaryKey().notNull(),

    org: varchar("org", { length: 255 }).notNull(),
    repo: varchar("repo", { length: 255 }).notNull(),
    issue: integer("issue").notNull(),

    stripeProductId: varchar("stripe_product_id", { length: 255 }).notNull(),

    bountyStatus: bountyStatusEnum("bounty_status").default("open").notNull(),
  },
  (t) => ({
    uniqueOrgRepoIssue: unique().on(t.org, t.repo, t.issue),
  })
)

export const checkoutSessionStatusList = [
  "complete",
  "expired",
  "open",
] as const satisfies Stripe.Checkout.Session.Status[]
export type CheckoutSessionStatus = (typeof checkoutSessionStatusList)[number]
export const checkoutSessionStatusEnum = pgEnum(
  "checkout_session_status",
  checkoutSessionStatusList
)

export const checkoutSession = pgTable("checkoutSession", {
  id: serial("id").primaryKey().notNull(),
  bountyIssueId: integer("bounty_issue_id")
    .notNull()
    .references(() => bountyIssue.id),
  stripeCheckoutSessionId: varchar("stripe_checkout_session_id", {
    length: 255,
  }).notNull(),
  amount: integer("amount").notNull(), // in cents
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  status: checkoutSessionStatusEnum("status").notNull(),
})

export const bountyIssueRelations = relations(bountyIssue, ({ many }) => ({
  checkoutSessions: many(checkoutSession),
}))
