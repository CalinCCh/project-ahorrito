CREATE TABLE "account_balances" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"current" integer NOT NULL,
	"available" integer,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account_balances" ADD CONSTRAINT "account_balances_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;