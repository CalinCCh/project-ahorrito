ALTER TABLE "transactions" ADD COLUMN "external_id" text;--> statement-breakpoint
CREATE UNIQUE INDEX "external_id_idx" ON "transactions" USING btree ("external_id");