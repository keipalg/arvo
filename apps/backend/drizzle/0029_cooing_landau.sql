ALTER TYPE "public"."operational_expense_type" ADD VALUE 'discount';--> statement-breakpoint
ALTER TYPE "public"."operational_expense_type" ADD VALUE 'shipping';--> statement-breakpoint
ALTER TABLE "sale" ADD COLUMN "discount_ref" uuid;--> statement-breakpoint
ALTER TABLE "sale" ADD COLUMN "shipping_fee_ref" uuid;--> statement-breakpoint
ALTER TABLE "sale" ADD CONSTRAINT "sale_discount_ref_operational_expense_id_fk" FOREIGN KEY ("discount_ref") REFERENCES "public"."operational_expense"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale" ADD CONSTRAINT "sale_shipping_fee_ref_operational_expense_id_fk" FOREIGN KEY ("shipping_fee_ref") REFERENCES "public"."operational_expense"("id") ON DELETE set null ON UPDATE no action;