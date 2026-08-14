ALTER TABLE "users" ADD COLUMN "overrideIneligible" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "slackId" text;