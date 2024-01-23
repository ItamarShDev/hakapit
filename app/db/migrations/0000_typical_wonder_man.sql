CREATE TABLE IF NOT EXISTS "episode" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"link" text NOT NULL,
	"description" text,
	"image_url" text,
	"audio_url" text NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp,
	"duration" text,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "podcast" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"link" text NOT NULL,
	"description" text,
	"image_url" text,
	"feed_url" text,
	"author_name" text,
	"author_email" text,
	"author_summary" text,
	"author_image_url" text,
	"episodes" integer,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "podcast" ADD CONSTRAINT "podcast_episodes_episode_id_fk" FOREIGN KEY ("episodes") REFERENCES "episode"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
