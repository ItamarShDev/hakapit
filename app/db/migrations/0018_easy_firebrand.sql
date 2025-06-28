CREATE TABLE IF NOT EXISTS "player" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"birth_date" timestamp NOT NULL,
	"nationality" text NOT NULL,
	"photo" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"logo" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transfer" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"date" timestamp NOT NULL,
	"team_id" integer NOT NULL,
	"type" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transfer" ADD CONSTRAINT "transfer_player_id_player_id_fk" FOREIGN KEY ("player_id") REFERENCES "player"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transfer" ADD CONSTRAINT "transfer_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
