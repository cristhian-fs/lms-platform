import { fileURLToPath } from "node:url";
import path from "node:path";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { env } from "@lms-platform/env/server";

export async function runMigrations() {
  const migrationsFolder = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "migrations",
  );
  const db = drizzle(env.DATABASE_URL);
  console.log("[db] running migrations from", migrationsFolder);
  await migrate(db, { migrationsFolder });
  console.log("[db] migrations complete");
}
