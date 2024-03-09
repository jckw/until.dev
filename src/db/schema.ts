import {
  integer,
  pgTable,
  serial,
  text,
  unique,
  varchar,
} from "drizzle-orm/pg-core"

export const bountyIssue = pgTable(
  "bounty_issue",
  {
    id: serial("id").primaryKey().notNull(),

    org: varchar("org", { length: 255 }).notNull(),
    repo: varchar("repo", { length: 255 }).notNull(),
    issue: integer("issue").notNull(),

    stripeProductId: varchar("stripe_product_id", { length: 255 }).notNull(),
  },
  (t) => ({
    uniqueOrgRepoIssue: unique().on(t.org, t.repo, t.issue),
  })
)
