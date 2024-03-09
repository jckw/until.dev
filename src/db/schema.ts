import {
  integer,
  pgEnum,
  pgTable,
  serial,
  unique,
  varchar,
} from "drizzle-orm/pg-core"

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
