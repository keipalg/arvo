ALTER TABLE "batch_recipe" ALTER COLUMN "usage_amount" SET DATA TYPE numeric(12, 2);--> statement-breakpoint
ALTER TABLE "good" ALTER COLUMN "retail_price" SET DATA TYPE numeric(12, 2);--> statement-breakpoint
ALTER TABLE "good" ALTER COLUMN "produced_quantity" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "material_output_ratio" ALTER COLUMN "input" SET DATA TYPE numeric(12, 2);--> statement-breakpoint
ALTER TABLE "good" ADD COLUMN "material_cost" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "good" ADD COLUMN "orverhead_cost" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "good" ADD COLUMN "labor_cost" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "good" ADD COLUMN "operating_cost" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "good" ADD COLUMN "net_profit" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "good" ADD COLUMN "minimum_stock_level" integer;--> statement-breakpoint
ALTER TABLE "material_output_ratio" DROP COLUMN "output";