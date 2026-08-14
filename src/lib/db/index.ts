import { drizzle } from "drizzle-orm/node-postgres";

export const db = drizzle(import.meta.env.DATABASE_URL);
