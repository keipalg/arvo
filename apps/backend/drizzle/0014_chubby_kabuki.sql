CREATE TABLE "production_status" (
	"id" uuid PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "production_batch" ADD COLUMN "statusId" uuid;--> statement-breakpoint
ALTER TABLE "production_batch" ADD COLUMN "quantity" integer;--> statement-breakpoint
ALTER TABLE "production_batch" ADD COLUMN "production_cost" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "production_batch" ADD CONSTRAINT "production_batch_statusId_production_status_id_fk" FOREIGN KEY ("statusId") REFERENCES "public"."production_status"("id") ON DELETE cascade ON UPDATE no action;