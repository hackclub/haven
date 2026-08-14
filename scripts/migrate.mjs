import { fileURLToPath } from "node:url";

import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

// Plain .mjs rather than TypeScript: this runs in the production image, where
// drizzle-kit and tsx are pruned along with the rest of the devDependencies.
// drizzle-orm and pg are runtime dependencies, so the migrator is available.

const url = process.env.DATABASE_URL;

if (!url) {
  console.error("[migrate] DATABASE_URL is not set");
  process.exit(1);
}

const migrationsFolder = fileURLToPath(new URL("../drizzle", import.meta.url));

const db = drizzle(url);

try {
  await migrate(db, { migrationsFolder });
  console.log("[migrate] up to date");
} finally {
  await db.$client.end();
}
