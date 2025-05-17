CREATE TABLE IF NOT EXISTS "bank_connections" (
  "id" text PRIMARY KEY,
  "user_id" text NOT NULL,
  "provider" text NOT NULL,
  "access_token" text NOT NULL,
  "refresh_token" text,
  "expires_at" timestamp,
  "institution_id" text,
  "institution_name" text,
  "status" text NOT NULL DEFAULT 'active',
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);