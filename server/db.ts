import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "../shared/schema";
import path from "path";

// Check if the USER_DATA_PATH environment variable is set
const USER_DATA_PATH = process.env.USER_DATA_PATH;

if (!USER_DATA_PATH) {
  throw new Error("USER_DATA_PATH environment variable is not set.");
}

const sqlite = new Database(path.join(USER_DATA_PATH, "db.sqlite"));

export const db = drizzle(sqlite, { schema });