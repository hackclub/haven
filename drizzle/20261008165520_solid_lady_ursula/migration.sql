ALTER TABLE "tickets" ADD COLUMN "escalatedAt" timestamp with time zone;
--> statement-breakpoint
-- Tickets already a day old count as escalated, so deploying this does not ping the helpers about the whole backlog at once.
UPDATE "tickets" SET "escalatedAt" = now() WHERE "createdAt" < now() - interval '24 hours';
