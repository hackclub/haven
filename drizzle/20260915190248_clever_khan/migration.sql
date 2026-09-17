CREATE TABLE "events" (
	"airtableId" text PRIMARY KEY,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"syncedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "events_slug_index" ON "events" ("slug");--> statement-breakpoint
CREATE INDEX "tickets_resolvedBy_index" ON "tickets" ("resolvedBy");--> statement-breakpoint
CREATE INDEX "tickets_resolvedAt_index" ON "tickets" ("resolvedAt");