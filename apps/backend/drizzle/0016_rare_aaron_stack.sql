ALTER TABLE "sale" ALTER COLUMN "total_price" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "sale" ALTER COLUMN "profit" SET DATA TYPE numeric(12, 2);--> statement-breakpoint
ALTER TABLE "sale" ALTER COLUMN "profit" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sale" ADD COLUMN "cogs" numeric(12, 2) DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "sale_detail" ADD COLUMN "cogs" numeric(12, 2) DEFAULT 0 NOT NULL;