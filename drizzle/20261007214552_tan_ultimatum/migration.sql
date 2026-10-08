CREATE TABLE "signup_notifications" (
	"eventId" text PRIMARY KEY,
	"conversationIds" text[] DEFAULT '{}'::text[] NOT NULL,
	"updatedBy" text NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "pocSlackIds" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
CREATE INDEX "events_pocSlackIds_index" ON "events" USING gin ("pocSlackIds");