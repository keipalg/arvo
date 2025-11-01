CREATE TYPE "public"."repeat_every" AS ENUM('daily', 'weekly', 'bi-weekly', 'monthly', 'quarterly', 'yearly');--> statement-breakpoint
ALTER TABLE "operational_expense" ADD COLUMN "repeat_every" "repeat_every";--> statement-breakpoint
ALTER TABLE "studio_overhead_expense" ADD COLUMN "repeat_every" "repeat_every";--> statement-breakpoint
ALTER TABLE "studio_overhead_expense" ADD COLUMN "start_date" timestamp;--> statement-breakpoint
ALTER TABLE "studio_overhead_expense" ADD COLUMN "due_date" timestamp;