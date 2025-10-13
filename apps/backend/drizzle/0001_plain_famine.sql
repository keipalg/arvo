CREATE TYPE "public"."operational_expense_type" AS ENUM('marketing', 'business_fee', 'utilities', 'office_supplies', 'studio_rent', 'labor', 'storage_fee', 'inventory_loss', 'miscellaneous');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('credit', 'cash');--> statement-breakpoint
CREATE TYPE "public"."studio_overhead_expense_type_enum" AS ENUM('tools_equipment', 'packaging_supplies', 'miscellaneous');--> statement-breakpoint
CREATE TABLE "operational_expense" (
	"id" uuid PRIMARY KEY NOT NULL,
	"expense_type" "operational_expense_type",
	"user_id" uuid NOT NULL,
	"name" text,
	"cost" numeric,
	"payee" text,
	"payment_method" "payment_method",
	"good_id" uuid,
	"materialAndSupply_id" uuid,
	"quantity" numeric,
	"notes" text,
	"attach_recipt" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"start_date" timestamp,
	"due_date" timestamp,
	CONSTRAINT "inventory_loss_check" CHECK (
				("operational_expense"."expense_type" <> 'inventory_loss')
				OR (
					("operational_expense"."good_id" IS NOT NULL AND "operational_expense"."materialAndSupply_id" IS NULL AND "operational_expense"."quantity" IS NOT NULL)
					OR
					("operational_expense"."good_id" IS NULL AND "operational_expense"."materialAndSupply_id" IS NOT NULL AND "operational_expense"."quantity" IS NOT NULL)
				)
			),
	CONSTRAINT "other_type_check" CHECK (
				("operational_expense"."expense_type" = 'inventory_loss')
				OR ("operational_expense"."name" IS NOT NULL AND "operational_expense"."cost" IS NOT NULL AND "operational_expense"."payee" IS NOT NULL AND "operational_expense"."payment_method" IS NOT NULL)
			)
);
--> statement-breakpoint
CREATE TABLE "studio_overhead_expense" (
	"id" uuid PRIMARY KEY NOT NULL,
	"expense_type" "studio_overhead_expense_type_enum",
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"cost" numeric NOT NULL,
	"payee" text NOT NULL,
	"payment_method" "payment_method",
	"notes" text,
	"attach_recipt" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "adminExpense" CASCADE;--> statement-breakpoint
DROP TABLE "adminExpenseType" CASCADE;--> statement-breakpoint
ALTER TABLE "operational_expense" ADD CONSTRAINT "operational_expense_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operational_expense" ADD CONSTRAINT "operational_expense_good_id_good_id_fk" FOREIGN KEY ("good_id") REFERENCES "public"."good"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operational_expense" ADD CONSTRAINT "operational_expense_materialAndSupply_id_material_and_supply_id_fk" FOREIGN KEY ("materialAndSupply_id") REFERENCES "public"."material_and_supply"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_overhead_expense" ADD CONSTRAINT "studio_overhead_expense_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;