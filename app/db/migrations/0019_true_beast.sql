DROP TABLE "player";--> statement-breakpoint
DROP TABLE "team";--> statement-breakpoint
ALTER TABLE "transfer" DROP CONSTRAINT "transfer_player_id_player_id_fk";
--> statement-breakpoint
ALTER TABLE "transfer" DROP CONSTRAINT "transfer_team_id_team_id_fk";
--> statement-breakpoint
ALTER TABLE "transfer" ADD COLUMN "player_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "transfer" ADD COLUMN "player_photo" text;--> statement-breakpoint
ALTER TABLE "transfer" ADD COLUMN "team_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "transfer" ADD COLUMN "team_logo" text;