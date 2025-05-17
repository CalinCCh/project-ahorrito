CREATE TABLE "predefined_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"emoji" text,
	CONSTRAINT "predefined_categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "transactions" RENAME COLUMN "category_id" TO "user_category_id";--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_category_id_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "predefined_category_id" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_category_id_categories_id_fk" FOREIGN KEY ("user_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_predefined_category_id_predefined_categories_id_fk" FOREIGN KEY ("predefined_category_id") REFERENCES "public"."predefined_categories"("id") ON DELETE set null ON UPDATE no action;