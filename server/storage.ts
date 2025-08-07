import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import * as schema from "../shared/schema";

const isProduction = process.env.NODE_ENV === "production";

const __dirname = fileURLToPath(import.meta.url);
const appDataPath = isProduction
  ? (process.env.USER_DATA_PATH as string)
  : join(__dirname, "../..");
const dbPath = join(appDataPath, "data/main.db");

const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });