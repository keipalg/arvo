ALTER TABLE "material_and_supply" ALTER COLUMN "last_purchase_date" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "material_and_supply" ADD COLUMN "cost_per_unit" numeric NOT NULL;