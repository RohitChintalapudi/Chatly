import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import path from "path";
import { fileURLToPath } from "url";

import { connectDB, disconnectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import contactRoutes from "./routes/contact.route.js";
import { app, server } from "./lib/socket.js";
import { notFoundHandler, errorHandler } from "./middleware/error.middleware.js";

dotenv.config();

const PORT = Number(process.env.PORT) || 5001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const missingConfig = ["MONGODB_URI", "JWT_SECRET"].filter((key) => !process.env[key]);
if (missingConfig.length > 0) {
  console.error(`Missing required environment variable(s): ${missingConfig.join(", ")}`);
  process.exit(1);
}

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow all origins dynamically to prevent CORS block issues in production/development
      callback(null, true);
    },
    credentials: true,
  })
);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/contact", contactRoutes);

// Unknown API paths should return JSON, never the SPA's index.html.
app.use("/api", notFoundHandler);

if (process.env.NODE_ENV === "production") {
  const frontendDist = path.join(__dirname, "../../frontend/dist");
  app.use(express.static(frontendDist));

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

app.use(notFoundHandler);
app.use(errorHandler);

// Establish the database connection before accepting traffic so requests never
// hit a half-initialized API on cold starts.
await connectDB();

server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
});

const shutdown = (signal) => {
  console.log(`${signal} received - shutting down gracefully...`);
  server.close(async () => {
    try {
      await disconnectDB();
      process.exit(0);
    } catch (error) {
      console.error("Error during shutdown:", error.message);
      process.exit(1);
    }
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
