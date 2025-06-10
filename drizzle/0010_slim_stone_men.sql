ALTER TABLE "accounts" DROP CONSTRAINT "accounts_plaid_id_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "user_plaid_id_unique" ON "accounts" USING btree ("user_id","plaid_id");