CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"token" uuid DEFAULT gen_random_uuid() NOT NULL UNIQUE,
	"hcaToken" text NOT NULL,
	"hcaId" text NOT NULL UNIQUE,
	"firstName" text NOT NULL,
	"lastName" text NOT NULL,
	"primaryEmail" text NOT NULL,
	"birthday" date,
	"phoneNumber" text,
	"yswsEligible" boolean NOT NULL,
	"verificationStatus" text NOT NULL,
	"address" jsonb DEFAULT 'null'
);
