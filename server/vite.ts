import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createServer } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function setupVite(app) {
  if (process.env.NODE_ENV !== "development") {
    // For production, serve the built client files
    app.use(express.static(path.resolve(__dirname, "..", "dist")));
    return;
  }

  // For development, use Vite middleware
  const vite = await createServer({
    root: path.resolve(__dirname, "..", "client"),
    server: {
      middlewareMode: true,
      port: 5173,
    },
    appType: "custom",
  });
  app.use(vite.middlewares);
}