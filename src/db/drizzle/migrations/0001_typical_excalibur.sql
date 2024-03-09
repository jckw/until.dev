DO $$ BEGIN
 CREATE TYPE "bounty_status" AS ENUM('open', 'paused');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "bounty_issue" ADD COLUMN "bounty_status" "bounty_status" NOT NULL;