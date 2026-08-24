CREATE TABLE "tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"helpMessageTs" text NOT NULL,
	"helpReplyMessageTs" text NOT NULL,
	"resolved" boolean DEFAULT false NOT NULL,
	"openedBy" text NOT NULL,
	"text" text NOT NULL,
	"latestMessageAt" timestamp with time zone DEFAULT now() NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "tickets_helpMessageTs_index" ON "tickets" ("helpMessageTs");--> statement-breakpoint
CREATE UNIQUE INDEX "tickets_helpReplyMessageTs_index" ON "tickets" ("helpReplyMessageTs");--> statement-breakpoint
CREATE INDEX "tickets_openedBy_index" ON "tickets" ("openedBy");--> statement-breakpoint
CREATE INDEX "tickets_latestMessageAt_index" ON "tickets" ("latestMessageAt");--> statement-breakpoint
CREATE INDEX "tickets_createdAt_index" ON "tickets" ("createdAt");