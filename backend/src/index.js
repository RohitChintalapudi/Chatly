import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import path from "path";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import contactRoutes from "./routes/contact.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT;
const __dirname = path.resolve();

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.NODE_ENV === "production"
      ? process.env.RENDER_EXTERNAL_URL || true
      : "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/contact", contactRoutes);

if (process.env.NODE_ENV === "production") {
  const frontendDist = path.join(__dirname, "../frontend/dist");
  app.use(express.static(frontendDist));

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
});
