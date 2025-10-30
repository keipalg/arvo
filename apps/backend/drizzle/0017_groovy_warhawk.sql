ALTER TABLE "production_batch" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "user_preference" ADD COLUMN "low_inventory_alert_for_goods" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "user_preference" ADD COLUMN "low_inventory_alert_for_materials" boolean DEFAULT true NOT NULL;