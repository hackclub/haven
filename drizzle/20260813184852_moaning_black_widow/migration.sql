ALTER TABLE "users" ADD COLUMN "legalFirstName" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "legalLastName" text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "yswsEligible" SET DEFAULT false;