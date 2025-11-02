CREATE TABLE "price_suggestion_cache" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"input_hash" text NOT NULL,
	"suggested_price" numeric(12, 2) NOT NULL,
	"price_range_min" numeric(12, 2) NOT NULL,
	"price_range_max" numeric(12, 2) NOT NULL,
	"reasoning" text NOT NULL,
	"market_insights" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "price_suggestion_cache_input_hash_unique" UNIQUE("input_hash")
);
--> statement-breakpoint
ALTER TABLE "production_batch" ALTER COLUMN "production_date" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "price_suggestion_cache" ADD CONSTRAINT "price_suggestion_cache_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;