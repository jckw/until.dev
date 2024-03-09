CREATE TABLE IF NOT EXISTS "bounty_issue" (
	"id" serial PRIMARY KEY NOT NULL,
	"org" varchar(255) NOT NULL,
	"repo" varchar(255) NOT NULL,
	"issue" integer NOT NULL,
	"stripe_product_id" varchar(255) NOT NULL,
	CONSTRAINT "bounty_issue_org_repo_issue_unique" UNIQUE("org","repo","issue")
);
