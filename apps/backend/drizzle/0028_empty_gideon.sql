ALTER TABLE "batch_recipe" ALTER COLUMN "usage_amount" SET DATA TYPE numeric(12, 6);--> statement-breakpoint
ALTER TABLE "good" ALTER COLUMN "material_cost" SET DATA TYPE numeric(12, 6);--> statement-breakpoint
ALTER TABLE "good" ALTER COLUMN "overhead_cost" SET DATA TYPE numeric(12, 6);--> statement-breakpoint
ALTER TABLE "good" ALTER COLUMN "labor_cost" SET DATA TYPE numeric(12, 6);--> statement-breakpoint
ALTER TABLE "good" ALTER COLUMN "operating_cost" SET DATA TYPE numeric(12, 6);--> statement-breakpoint
ALTER TABLE "good" ALTER COLUMN "net_profit" SET DATA TYPE numeric(12, 6);--> statement-breakpoint
ALTER TABLE "material_and_supply" ALTER COLUMN "cost_per_unit" SET DATA TYPE numeric(12, 6);--> statement-breakpoint
ALTER TABLE "sale" ALTER COLUMN "cogs" SET DATA TYPE numeric(12, 6);--> statement-breakpoint
ALTER TABLE "sale" ALTER COLUMN "profit" SET DATA TYPE numeric(12, 6);--> statement-breakpoint
ALTER TABLE "sale_detail" ALTER COLUMN "cogs" SET DATA TYPE numeric(12, 6);