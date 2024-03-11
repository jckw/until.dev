ALTER TABLE "checkout_session"
ADD COLUMN "payment_intent_id" varchar(255) NOT NULL DEFAULT gen_random_uuid();
--> statement-breakpoint
ALTER TABLE "checkout_session"
ALTER COLUMN "payment_intent_id" DROP DEFAULT;
ALTER TABLE "checkout_session"
ADD CONSTRAINT "checkout_session_payment_intent_id_unique" UNIQUE("payment_intent_id");