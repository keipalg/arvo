CREATE TABLE "material_type" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "material_and_supply" RENAME COLUMN "material_type" TO "material_type_id";--> statement-breakpoint
ALTER TABLE "material_type" ADD CONSTRAINT "material_type_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "material_and_supply" ADD CONSTRAINT "material_and_supply_material_type_id_material_type_id_fk" FOREIGN KEY ("material_type_id") REFERENCES "public"."material_type"("id") ON DELETE no action ON UPDATE no action;