CREATE TABLE "savings_contributions" (
	"id" text PRIMARY KEY NOT NULL,
	"goal_id" text NOT NULL,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'MXN' NOT NULL,
	"type" text DEFAULT 'manual' NOT NULL,
	"source" text,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"transaction_id" text
);

CREATE TABLE "savings_goals" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"target_amount" integer NOT NULL,
	"current_amount" integer DEFAULT 0 NOT NULL,
	"currency" text DEFAULT 'MXN' NOT NULL,
	"category" text NOT NULL,
	"emoji" text DEFAULT '🎯',
	"color" text DEFAULT 'blue',
	"priority" text DEFAULT 'medium' NOT NULL,
	"target_date" timestamp,
	"monthly_contribution" integer DEFAULT 0,
	"auto_save" text DEFAULT 'manual',
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);

CREATE TABLE "savings_milestones" (
	"id" text PRIMARY KEY NOT NULL,
	"goal_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"percentage" integer NOT NULL,
	"target_amount" integer NOT NULL,
	"is_completed" text DEFAULT 'false' NOT NULL,
	"completed_at" timestamp,
	"reward_message" text,
	"emoji" text DEFAULT '🏆',
	"created_at" timestamp DEFAULT now()
);

ALTER TABLE "savings_contributions" ADD CONSTRAINT "savings_contributions_goal_id_savings_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."savings_goals"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "savings_contributions" ADD CONSTRAINT "savings_contributions_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "savings_milestones" ADD CONSTRAINT "savings_milestones_goal_id_savings_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."savings_goals"("id") ON DELETE cascade ON UPDATE no action;
