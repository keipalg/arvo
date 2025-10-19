ALTER TABLE "good_to_production_expense_ratio" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "material_type" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "production_batch_to_production_expense" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "production_expense" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "production_expense_ratio" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "good_to_production_expense_ratio" CASCADE;--> statement-breakpoint
DROP TABLE "material_type" CASCADE;--> statement-breakpoint
DROP TABLE "production_batch_to_production_expense" CASCADE;--> statement-breakpoint
DROP TABLE "production_expense" CASCADE;--> statement-breakpoint
DROP TABLE "production_expense_ratio" CASCADE;--> statement-breakpoint
ALTER TABLE "material_and_supply" DROP CONSTRAINT "material_and_supply_material_type_id_material_type_id_fk";
--> statement-breakpoint
ALTER TABLE "material_and_supply" ADD COLUMN "material_type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "material_and_supply" ADD COLUMN "cost_per_unit" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "user_preference" ADD COLUMN "profit_percentage" numeric;--> statement-breakpoint
ALTER TABLE "user_preference" ADD COLUMN "operating_cost_percentage" numeric;--> statement-breakpoint
ALTER TABLE "user_preference" ADD COLUMN "labor_cost_percentage" numeric;--> statement-breakpoint
ALTER TABLE "material_and_supply" DROP COLUMN "material_type_id";