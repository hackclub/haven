import {
  boolean,
  date,
  integer,
  jsonb,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import type { HCAAddress } from "../services/hca";
import { encryptedText } from "./columns";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  token: uuid().unique().notNull().defaultRandom(),
  hcaToken: encryptedText().notNull(),
  hcaId: text().unique().notNull(),
  firstName: text().notNull(),
  lastName: text().notNull(),
  legalFirstName: text(),
  legalLastName: text(),
  primaryEmail: text().notNull(),
  birthday: date(),
  phoneNumber: text(),
  yswsEligible: boolean().notNull().default(false),
  verificationStatus: text().notNull(),
  overrideIneligible: boolean().notNull().default(false),
  slackId: text(),
  address: jsonb().$type<HCAAddress | null>().default(null),
});
