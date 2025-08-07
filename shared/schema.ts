import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core"; // استخدام sqlite-core فقط
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey().notNull(), // استخدام text بدلاً من varchar، وإزالة default(sql`gen_random_uuid()`)
  title: text("title").notNull(),
  topic: text("topic").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  time: text("time").default("09:00"), // HH:MM format
  isDone: integer("is_done", { mode: "boolean" }).default(false), // استخدام integer(mode: "boolean") بدلاً من boolean
  progress: integer("progress").default(0), // 0-100
  difficulty: text("difficulty").$type<"easy" | "medium" | "hard">().default("medium"),
  orderIndex: integer("order_index").default(0),
  focusSessions: integer("focus_sessions").default(0),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`), // استخدام text بدلاً من timestamp
});

export const focusSessions = sqliteTable("focus_sessions", {
  id: text("id").primaryKey().notNull(), // استخدام text بدلاً من varchar، وإزالة default(sql`gen_random_uuid()`)
  taskId: text("task_id").references(() => tasks.id),
  duration: integer("duration").notNull(), // in minutes
  completedAt: text("completed_at").default(sql`CURRENT_TIMESTAMP`), // استخدام text بدلاً من timestamp
  sessionType: text("session_type").$type<"focus" | "break">().default("focus"),
});

export const settings = sqliteTable("settings", {
  id: text("id").primaryKey().notNull(), // استخدام text بدلاً من varchar، وإزالة default(sql`gen_random_uuid()`)
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

export const insertFocusSessionSchema = createInsertSchema(focusSessions).omit({
  id: true,
  completedAt: true,
});

export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type FocusSession = typeof focusSessions.$inferSelect;
export type InsertFocusSession = z.infer<typeof insertFocusSessionSchema>;
export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;