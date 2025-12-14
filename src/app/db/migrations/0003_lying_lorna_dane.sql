ALTER TABLE "episode" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "episode" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "episode" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "episode" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "podcast" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "podcast" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "podcast" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "podcast" ALTER COLUMN "updated_at" SET NOT NULL;