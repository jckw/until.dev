ALTER TABLE "checkout_session" ADD COLUMN "successful_stripe_charge_id" varchar(255);--> statement-breakpoint
ALTER TABLE "checkout_session" ADD COLUMN "net_amount" integer;--> statement-breakpoint
ALTER TABLE "checkout_session" ADD COLUMN "fee_amount" integer;--> statement-breakpoint
ALTER TABLE "checkout_session" DROP COLUMN IF EXISTS "status";--> statement-breakpoint
ALTER TABLE "checkout_session" ADD CONSTRAINT "checkout_session_successful_stripe_charge_id_unique" UNIQUE("successful_stripe_charge_id");