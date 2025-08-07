import { db } from "./db";
import { tasks, focusSessions, insertTaskSchema } from "../shared/schema";
import { lte, eq, or, gte, and, sql } from "drizzle-orm";
import { z } from "zod";
import dayjs from "dayjs";
import express from "express";
import { v4 as uuidv4 } from "uuid";
import { Router } from "express";

const today = dayjs().format("YYYY-MM-DD");
const router = Router();

export function registerRoutes(app: express.Express) {
  // Get all tasks
  app.get("/api/tasks", async (req, res) => {
    try {
      const allTasks = await db.select().from(tasks).all();
      res.json(allTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  // Get today's tasks
  app.get("/api/tasks/today", async (req, res) => {
    try {
      const todayTasks = await db.select().from(tasks).where(eq(tasks.date, today)).all();
      res.json(todayTasks);
    } catch (error) {
      console.error("Error fetching today's tasks:", error);
      res.status(500).json({ error: "Failed to fetch today's tasks" });
    }
  });

  // Get overdue tasks
  app.get("/api/tasks/overdue", async (req, res) => {
    try {
      const overdueTasks = await db
        .select()
        .from(tasks)
        .where(and(lte(tasks.date, today), eq(tasks.isDone, false)))
        .all();
      res.json(overdueTasks);
    } catch (error) {
      console.error("Error fetching overdue tasks:", error);
      res.status(500).json({ error: "Failed to fetch overdue tasks" });
    }
  });

  // Create a new task
  app.post("/api/tasks", async (req, res) => {
    try {
      const newTaskData = insertTaskSchema.parse(req.body);
      const insertedTask = await db
        .insert(tasks)
        .values({ id: uuidv4(), ...newTaskData })
        .returning()
        .get();
      res.status(201).json(insertedTask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid data", details: error.issues });
      } else {
        console.error("Error creating task:", error);
        res.status(500).json({ error: "Failed to create task" });
      }
    }
  });

  // Update a task
  app.put("/api/tasks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updatedTaskData = insertTaskSchema.partial().parse(req.body);
      const updatedTask = await db
        .update(tasks)
        .set(updatedTaskData)
        .where(eq(tasks.id, id))
        .returning()
        .get();
      if (updatedTask) {
        res.json(updatedTask);
      } else {
        res.status(404).json({ error: "Task not found" });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid data", details: error.issues });
      } else {
        console.error("Error updating task:", error);
        res.status(500).json({ error: "Failed to update task" });
      }
    }
  });

  // Delete a task
  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deletedTask = await db
        .delete(tasks)
        .where(eq(tasks.id, id))
        .returning()
        .get();
      if (deletedTask) {
        res.status(200).json({ message: "Task deleted successfully" });
      } else {
        res.status(404).json({ error: "Task not found" });
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  // Get all focus sessions
  app.get("/api/focus-sessions", async (req, res) => {
    try {
      const allFocusSessions = await db.select().from(focusSessions).all();
      res.json(allFocusSessions);
    } catch (error) {
      console.error("Error fetching focus sessions:", error);
      res.status(500).json({ error: "Failed to fetch focus sessions" });
    }
  });

  // Get analytics stats
  app.get("/api/analytics/stats", async (req, res) => {
    try {
      const completedTasks = await db
        .select({ count: sql<number>`count(*)` })
        .from(tasks)
        .where(eq(tasks.isDone, true))
        .get();
      const totalTasks = await db
        .select({ count: sql<number>`count(*)` })
        .from(tasks)
        .get();
      const totalFocusTime = await db
        .select({ totalDuration: sql<number>`sum(duration)` })
        .from(focusSessions)
        .get();

      res.json({
        completedTasks: completedTasks?.count || 0,
        totalTasks: totalTasks?.count || 0,
        totalFocusTime: totalFocusTime?.totalDuration || 0,
      });
    } catch (error) {
      console.error("Error fetching analytics stats:", error);
      res.status(500).json({ error: "Failed to fetch analytics stats" });
    }
  });

  // New routes added from your request
  router.get("/tasks/overdue", async (req, res) => {
    try {
      const result = await db
        .select()
        .from(tasks)
        .where(lte(tasks.due_date, new Date()));
      res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching overdue tasks:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.patch("/tasks/:id", async (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;

    try {
      const updated = await db
        .update(tasks)
        .set({ completed })
        .where(eq(tasks.id, id));

      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  });

  // Register the router with the main app
  app.use(router);
}