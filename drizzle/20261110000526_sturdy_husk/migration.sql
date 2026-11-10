CREATE TABLE "announcement_clicks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"actionId" text NOT NULL,
	"blockId" text NOT NULL,
	"value" text,
	"buttonText" text,
	"actionTs" text NOT NULL,
	"userId" text NOT NULL,
	"username" text,
	"teamId" text,
	"containerType" text NOT NULL,
	"channelId" text,
	"channelName" text,
	"messageTs" text,
	"messageText" text,
	"isEphemeral" boolean,
	"viewId" text,
	"payload" jsonb NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "announcement_clicks_actionId_index" ON "announcement_clicks" ("actionId");--> statement-breakpoint
CREATE INDEX "announcement_clicks_userId_index" ON "announcement_clicks" ("userId");--> statement-breakpoint
CREATE INDEX "announcement_clicks_messageTs_index" ON "announcement_clicks" ("messageTs");--> statement-breakpoint
CREATE INDEX "announcement_clicks_createdAt_index" ON "announcement_clicks" ("createdAt");