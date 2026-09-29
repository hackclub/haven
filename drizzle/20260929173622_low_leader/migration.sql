CREATE TABLE "signup_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"counts" jsonb NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "participantCount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX "signup_snapshots_createdAt_index" ON "signup_snapshots" ("createdAt");