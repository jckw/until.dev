DO $$ BEGIN
 CREATE TYPE "checkout_session_status" AS ENUM('complete', 'expired', 'open');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "checkoutSession" (
	"id" serial PRIMARY KEY NOT NULL,
	"bounty_issue_id" integer NOT NULL,
	"stripe_checkout_session_id" varchar(255) NOT NULL,
	"amount" integer NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"status" "checkout_session_status" NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "checkoutSession" ADD CONSTRAINT "checkoutSession_bounty_issue_id_bounty_issue_id_fk" FOREIGN KEY ("bounty_issue_id") REFERENCES "bounty_issue"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
