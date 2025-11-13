CREATE TABLE "dashboard_overview_cache" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"input_hash" text NOT NULL,
	"overview" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "dashboard_overview_cache_input_hash_unique" UNIQUE("input_hash")
);
