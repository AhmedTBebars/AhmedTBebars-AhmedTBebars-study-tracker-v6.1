import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./shared/schema.ts", // تم تصحيح المسار
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: "./data/main.db",
  },
});