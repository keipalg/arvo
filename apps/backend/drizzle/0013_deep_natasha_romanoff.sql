ALTER TABLE "sale" ALTER COLUMN "discount" SET DATA TYPE numeric(12, 2);--> statement-breakpoint
ALTER TABLE "sale" ALTER COLUMN "shipping_fee" SET DATA TYPE numeric(12, 2);--> statement-breakpoint
ALTER TABLE "sale" ALTER COLUMN "tax_percentage" SET DATA TYPE numeric(12, 2);--> statement-breakpoint
ALTER TABLE "sale" ALTER COLUMN "total_price" SET DATA TYPE numeric(12, 2);--> statement-breakpoint
ALTER TABLE "sale_detail" ALTER COLUMN "price_per_item" SET DATA TYPE numeric(12, 2);--> statement-breakpoint
ALTER TABLE "user_preference" ADD COLUMN "est_monthly_operating_expenses" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "user_preference" ADD COLUMN "est_monthly_produced_units" integer;