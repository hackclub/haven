CREATE TABLE "ticket_summaries" (
	"ts" text PRIMARY KEY,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "ticket_summaries_createdAt_index" ON "ticket_summaries" ("createdAt");