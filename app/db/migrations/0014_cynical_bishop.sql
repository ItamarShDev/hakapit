ALTER TABLE "subscription" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "expiration_time" timestamp;