CREATE TABLE "material_inventory_transaction" (
	"id" uuid PRIMARY KEY NOT NULL,
	"material_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"quantity_change" numeric(12, 2) NOT NULL,
	"quantity_before" numeric(12, 2) NOT NULL,
	"quantity_after" numeric(12, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "material_and_supply" ADD COLUMN "purchase_price" numeric(12, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "material_and_supply" ADD COLUMN "purchase_quantity" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "material_inventory_transaction" ADD CONSTRAINT "material_inventory_transaction_material_id_material_and_supply_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."material_and_supply"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "material_inventory_transaction" ADD CONSTRAINT "material_inventory_transaction_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;