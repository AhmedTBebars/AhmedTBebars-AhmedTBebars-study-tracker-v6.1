import express from "express";
import cors from "cors";
import path from "path";
import { registerRoutes } from "./routes";
import { db } from "./db";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// تشغيل ترحيل قاعدة البيانات (migrations)
const runMigrations = async () => {
  try {
    console.log("[٠٢:٢٦:٤٤ ص] Running migrations...");
    const migrationsFolder = path.join(__dirname, "..", "drizzle");
    migrate(db, { migrationsFolder });
    console.log("[٠٢:٢٦:٤٤ ص] Migrations complete!");
  } catch (error) {
    console.error("Error during migrations:", error);
    process.exit(1); // إيقاف التطبيق إذا فشل الترحيل
  }
};

const startServer = async () => {
  // تشغيل الترحيل أولاً
  await runMigrations();

  // تسجيل المسارات
  registerRoutes(app);

  // بدء الخادم
  app.listen(port, "127.0.0.1", () => {
    console.log(`[٠٢:٢٦:٤٤ ص] ✅ Server listening on 127.0.0.1:${port}`);
  });
};

startServer();