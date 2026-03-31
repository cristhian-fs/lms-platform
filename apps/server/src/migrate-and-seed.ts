import { runMigrations } from "@lms-platform/db/migrate";
import { runSeed } from "./seed";

await runMigrations();
await runSeed();
