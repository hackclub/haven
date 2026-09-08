ALTER TABLE "tickets" ADD COLUMN "resolvedAt" timestamp with time zone;
UPDATE "tickets" SET "resolvedAt" = '1970-01-01T00:00:00Z';