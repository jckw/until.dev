ALTER TABLE "checkout_session" RENAME TO "contribution";--> statement-breakpoint
ALTER TABLE "contribution" RENAME COLUMN "payment_intent_id" TO "stripe_payment_intent_id";--> statement-breakpoint
ALTER TABLE "contribution" DROP CONSTRAINT "checkout_session_stripe_checkout_session_id_unique";--> statement-breakpoint
ALTER TABLE "contribution" DROP CONSTRAINT "checkout_session_payment_intent_id_unique";--> statement-breakpoint
ALTER TABLE "contribution" DROP CONSTRAINT "checkout_session_successful_stripe_charge_id_unique";--> statement-breakpoint
ALTER TABLE "contribution" DROP CONSTRAINT "checkout_session_bounty_issue_id_bounty_issue_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contribution" ADD CONSTRAINT "contribution_bounty_issue_id_bounty_issue_id_fk" FOREIGN KEY ("bounty_issue_id") REFERENCES "bounty_issue"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "contribution" ADD CONSTRAINT "contribution_stripe_checkout_session_id_unique" UNIQUE("stripe_checkout_session_id");--> statement-breakpoint
ALTER TABLE "contribution" ADD CONSTRAINT "contribution_stripe_payment_intent_id_unique" UNIQUE("stripe_payment_intent_id");--> statement-breakpoint
ALTER TABLE "contribution" ADD CONSTRAINT "contribution_successful_stripe_charge_id_unique" UNIQUE("successful_stripe_charge_id");