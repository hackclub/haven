ALTER TABLE "tickets" RENAME COLUMN "resolved" TO "resolvedBy";--> statement-breakpoint
ALTER TABLE "tickets" ALTER COLUMN "resolvedBy" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "tickets" ALTER COLUMN "resolvedBy" SET DATA TYPE text USING CASE WHEN "resolvedBy" THEN 'USLACKBOT' END;--> statement-breakpoint
ALTER TABLE "tickets" ALTER COLUMN "resolvedBy" DROP DEFAULT;