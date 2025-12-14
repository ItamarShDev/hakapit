ALTER TABLE "episode" ADD COLUMN "guid" text;--> statement-breakpoint
ALTER TABLE "episode" ADD CONSTRAINT "episode_guid_unique" UNIQUE("guid");