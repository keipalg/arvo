ALTER TABLE "operational_expense" DROP CONSTRAINT "inventory_loss_check";--> statement-breakpoint
ALTER TABLE "operational_expense" DROP CONSTRAINT "other_type_check";--> statement-breakpoint
ALTER TABLE "operational_expense" ALTER COLUMN "expense_type" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "operational_expense" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "operational_expense" ALTER COLUMN "cost" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "operational_expense" ALTER COLUMN "payee" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "operational_expense" ALTER COLUMN "payment_method" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "operational_expense" ALTER COLUMN "quantity" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "operational_expense" ALTER COLUMN "notes" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "operational_expense" ALTER COLUMN "attach_recipt" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "operational_expense" ALTER COLUMN "created_at" DROP DEFAULT;