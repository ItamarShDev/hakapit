ALTER TABLE "post" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "post" ALTER COLUMN "title" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "image_url" text;