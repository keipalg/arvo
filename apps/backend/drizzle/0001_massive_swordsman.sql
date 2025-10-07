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
CREATE TABLE "channel" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "goods" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"puroduct_type_id" uuid,
	"image" text,
	"retail_price" numeric,
	"size" text,
	"color" text,
	"production_date" date,
	"note" text,
	"sold_quantity" integer DEFAULT 0,
	"tags_id" uuid[],
	"quantity" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "material_and_supply" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"unit_id" uuid NOT NULL,
	"purchase_price" numeric NOT NULL,
	"cost_per_unit" numeric,
	"quantity" integer NOT NULL,
	"threshold" integer,
	"supplier" text NOT NULL,
	"purchase_date" date DEFAULT now(),
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
CREATE TABLE "notifications" (
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
CREATE TABLE "product_material_used" (
	"id" uuid PRIMARY KEY NOT NULL,
	"goods_id" uuid NOT NULL,
	"material_and_supply_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
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
CREATE TABLE "sales" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"channel_id" uuid NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"good" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"total_price" numeric NOT NULL,
	"profit" numeric,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY NOT NULL,
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
ALTER TABLE "sample" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_preference" ADD COLUMN "product_type_ids" uuid[] NOT NULL;--> statement-breakpoint
ALTER TABLE "user_preference" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "user_preference" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "adminExpense" ADD CONSTRAINT "adminExpense_adminExpenseType_id_adminExpenseType_id_fk" FOREIGN KEY ("adminExpenseType_id") REFERENCES "public"."adminExpenseType"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adminExpense" ADD CONSTRAINT "adminExpense_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goods" ADD CONSTRAINT "goods_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goods" ADD CONSTRAINT "goods_puroduct_type_id_product_type_id_fk" FOREIGN KEY ("puroduct_type_id") REFERENCES "public"."product_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "material_and_supply" ADD CONSTRAINT "material_and_supply_unit_id_unit_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."unit"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_type_notification_type_id_fk" FOREIGN KEY ("type") REFERENCES "public"."notification_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_material_used" ADD CONSTRAINT "product_material_used_goods_id_goods_id_fk" FOREIGN KEY ("goods_id") REFERENCES "public"."goods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_material_used" ADD CONSTRAINT "product_material_used_material_and_supply_id_material_and_supply_id_fk" FOREIGN KEY ("material_and_supply_id") REFERENCES "public"."material_and_supply"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_channel_id_channel_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channel"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_good_goods_id_fk" FOREIGN KEY ("good") REFERENCES "public"."goods"("id") ON DELETE no action ON UPDATE no action;