ALTER TABLE "podcast" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "podcast" ADD CONSTRAINT "podcast_name_unique" UNIQUE("name");