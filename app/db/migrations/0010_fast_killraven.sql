ALTER TABLE "podcast" DROP CONSTRAINT "podcast_episodes_episode_id_fk";
--> statement-breakpoint
ALTER TABLE "episode" ADD COLUMN "podcast_name" text;--> statement-breakpoint
ALTER TABLE "podcast" DROP COLUMN IF EXISTS "episodes";