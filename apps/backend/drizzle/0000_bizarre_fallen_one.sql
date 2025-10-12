CREATE TABLE "adminExpense" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"adminExpenseType_id" uuid NOT NULL,
	"cost" numeric(12, 2) NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "adminExpenseType" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "batch_recipe" (
	"id" uuid PRIMARY KEY NOT NULL,
	"material_id" uuid NOT NULL,
	"usage_amount" numeric,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "channel" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collection_tag" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "good" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"product_type_id" uuid,
	"image" text,
	"retail_price" numeric NOT NULL,
	"note" text,
	"inventory_quantity" integer DEFAULT 0,
	"produced_quantity" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "good_to_collection_tag" (
	"good_id" uuid NOT NULL,
	"collection_tag_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "good_to_material_output_ratio" (
	"good_id" uuid NOT NULL,
	"material_output_ratio_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "good_to_production_expense_ratio" (
	"good_id" uuid NOT NULL,
	"production_expense_ratio_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "material_and_supply" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"material_type_id" uuid NOT NULL,
	"unit_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"purchase_price" numeric NOT NULL,
	"last_purchase_date" date,
	"supplier" text NOT NULL,
	"notes" text,
	"threshold" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "material_output_ratio" (
	"id" uuid PRIMARY KEY NOT NULL,
	"material_id" uuid NOT NULL,
	"input" numeric NOT NULL,
	"output" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "material_type" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"type" uuid NOT NULL,
	"notified_at" timestamp DEFAULT now() NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_type" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_type" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "production_batch" (
	"id" uuid PRIMARY KEY NOT NULL,
	"good_id" uuid NOT NULL,
	"production_date" timestamp with time zone NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "production_batch_to_batch_recipe" (
	"production_batch_id" uuid NOT NULL,
	"batch_recipe_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "production_batch_to_production_expense" (
	"production_batch_id" uuid NOT NULL,
	"production_expense_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "production_expense" (
	"id" uuid PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"cost" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "type_allowed_values" CHECK ("production_expense"."type" IN ('labor', 'rent'))
);
--> statement-breakpoint
CREATE TABLE "production_expense_ratio" (
	"id" uuid PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"cost" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "type_allowed_values" CHECK ("production_expense_ratio"."type" IN ('labor', 'rent'))
);
--> statement-breakpoint
CREATE TABLE "sale" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"customer" text NOT NULL,
	"sales_number" integer NOT NULL,
	"channel_id" uuid NOT NULL,
	"date" timestamp NOT NULL,
	"status_id" uuid NOT NULL,
	"note" text,
	"discount" numeric DEFAULT '0' NOT NULL,
	"shipping_fee" numeric DEFAULT '0' NOT NULL,
	"tax_percentage" numeric DEFAULT '0' NOT NULL,
	"total_price" numeric NOT NULL,
	"profit" numeric,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sale_detail" (
	"id" uuid PRIMARY KEY NOT NULL,
	"sale_id" uuid NOT NULL,
	"good_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"price_per_item" numeric NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sample" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sample_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "status" (
	"id" uuid PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "unit" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"abbreviation" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_preference" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"product_type_ids" uuid[] NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" uuid NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" uuid PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" uuid NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "adminExpense" ADD CONSTRAINT "adminExpense_adminExpenseType_id_adminExpenseType_id_fk" FOREIGN KEY ("adminExpenseType_id") REFERENCES "public"."adminExpenseType"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adminExpense" ADD CONSTRAINT "adminExpense_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batch_recipe" ADD CONSTRAINT "batch_recipe_material_id_material_and_supply_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."material_and_supply"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "good" ADD CONSTRAINT "good_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "good" ADD CONSTRAINT "good_product_type_id_product_type_id_fk" FOREIGN KEY ("product_type_id") REFERENCES "public"."product_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "good_to_collection_tag" ADD CONSTRAINT "good_to_collection_tag_good_id_good_id_fk" FOREIGN KEY ("good_id") REFERENCES "public"."good"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "good_to_collection_tag" ADD CONSTRAINT "good_to_collection_tag_collection_tag_id_collection_tag_id_fk" FOREIGN KEY ("collection_tag_id") REFERENCES "public"."collection_tag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "good_to_material_output_ratio" ADD CONSTRAINT "good_to_material_output_ratio_good_id_good_id_fk" FOREIGN KEY ("good_id") REFERENCES "public"."good"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "good_to_material_output_ratio" ADD CONSTRAINT "good_to_material_output_ratio_material_output_ratio_id_material_output_ratio_id_fk" FOREIGN KEY ("material_output_ratio_id") REFERENCES "public"."material_output_ratio"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "good_to_production_expense_ratio" ADD CONSTRAINT "good_to_production_expense_ratio_good_id_good_id_fk" FOREIGN KEY ("good_id") REFERENCES "public"."good"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "good_to_production_expense_ratio" ADD CONSTRAINT "good_to_production_expense_ratio_production_expense_ratio_id_production_expense_ratio_id_fk" FOREIGN KEY ("production_expense_ratio_id") REFERENCES "public"."production_expense_ratio"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "material_and_supply" ADD CONSTRAINT "material_and_supply_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "material_and_supply" ADD CONSTRAINT "material_and_supply_material_type_id_material_type_id_fk" FOREIGN KEY ("material_type_id") REFERENCES "public"."material_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "material_and_supply" ADD CONSTRAINT "material_and_supply_unit_id_unit_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."unit"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "material_output_ratio" ADD CONSTRAINT "material_output_ratio_material_id_material_and_supply_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."material_and_supply"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_type_notification_type_id_fk" FOREIGN KEY ("type") REFERENCES "public"."notification_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_batch" ADD CONSTRAINT "production_batch_good_id_good_id_fk" FOREIGN KEY ("good_id") REFERENCES "public"."good"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_batch_to_batch_recipe" ADD CONSTRAINT "production_batch_to_batch_recipe_production_batch_id_production_batch_id_fk" FOREIGN KEY ("production_batch_id") REFERENCES "public"."production_batch"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_batch_to_batch_recipe" ADD CONSTRAINT "production_batch_to_batch_recipe_batch_recipe_id_batch_recipe_id_fk" FOREIGN KEY ("batch_recipe_id") REFERENCES "public"."batch_recipe"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_batch_to_production_expense" ADD CONSTRAINT "production_batch_to_production_expense_production_batch_id_production_batch_id_fk" FOREIGN KEY ("production_batch_id") REFERENCES "public"."production_batch"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_batch_to_production_expense" ADD CONSTRAINT "production_batch_to_production_expense_production_expense_id_production_expense_id_fk" FOREIGN KEY ("production_expense_id") REFERENCES "public"."production_expense"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale" ADD CONSTRAINT "sale_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale" ADD CONSTRAINT "sale_channel_id_channel_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channel"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale" ADD CONSTRAINT "sale_status_id_status_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."status"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_detail" ADD CONSTRAINT "sale_detail_sale_id_sale_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sale"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_detail" ADD CONSTRAINT "sale_detail_good_id_good_id_fk" FOREIGN KEY ("good_id") REFERENCES "public"."good"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preference" ADD CONSTRAINT "user_preference_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;