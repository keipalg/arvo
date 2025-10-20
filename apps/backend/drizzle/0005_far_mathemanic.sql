ALTER TABLE "material_and_supply" ALTER COLUMN "quantity" SET DATA TYPE numeric(12, 2);--> statement-breakpoint
ALTER TABLE "material_and_supply" ALTER COLUMN "purchase_price" SET DATA TYPE numeric(12, 2);--> statement-breakpoint
ALTER TABLE "material_and_supply" ALTER COLUMN "cost_per_unit" SET DATA TYPE numeric(12, 2);--> statement-breakpoint
ALTER TABLE "material_and_supply" ALTER COLUMN "threshold" SET DATA TYPE numeric(12, 2);--> statement-breakpoint
ALTER TABLE "unit" ADD COLUMN "category" text NOT NULL;