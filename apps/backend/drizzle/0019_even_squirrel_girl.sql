ALTER TABLE "user_preference" ADD COLUMN "has_completed_setup" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "phone";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "store_name";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "store_location";