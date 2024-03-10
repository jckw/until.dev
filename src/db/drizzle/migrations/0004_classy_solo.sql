ALTER TABLE "checkoutSession" RENAME TO "checkout_session";--> statement-breakpoint
ALTER TABLE "checkout_session" DROP CONSTRAINT "checkoutSession_bounty_issue_id_bounty_issue_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "checkout_session" ADD CONSTRAINT "checkout_session_bounty_issue_id_bounty_issue_id_fk" FOREIGN KEY ("bounty_issue_id") REFERENCES "bounty_issue"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
