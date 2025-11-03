ALTER TABLE "notification" RENAME COLUMN "type" TO "type_id";--> statement-breakpoint
ALTER TABLE "notification" DROP CONSTRAINT "notification_type_notification_type_id_fk";
--> statement-breakpoint
ALTER TABLE "notification" ADD COLUMN "title" text NOT NULL;--> statement-breakpoint
ALTER TABLE "notification_type" ADD COLUMN "key" text NOT NULL;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_type_id_notification_type_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."notification_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_type" ADD CONSTRAINT "notification_type_key_unique" UNIQUE("key");