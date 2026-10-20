CREATE TYPE "public"."entry_kind" AS ENUM('income', 'expense');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "categories_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(64) NOT NULL,
	"kind" "entry_kind" NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entries" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "entries_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(120) NOT NULL,
	"category_id" integer NOT NULL,
	"amount_cents" integer NOT NULL,
	"occurred_on" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "entries_amount_positive" CHECK ("entries"."amount_cents" > 0)
);
--> statement-breakpoint
CREATE TABLE "preferences" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"currency" varchar(3) DEFAULT 'EUR' NOT NULL,
	"locale" text DEFAULT 'de-DE' NOT NULL,
	CONSTRAINT "preferences_singleton" CHECK ("preferences"."id" = 1)
);
--> statement-breakpoint
ALTER TABLE "entries" ADD CONSTRAINT "entries_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "categories_kind_name_idx" ON "categories" USING btree ("kind",lower("name"));--> statement-breakpoint
CREATE INDEX "entries_occurred_on_idx" ON "entries" USING btree ("occurred_on");