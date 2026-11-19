import express from "express";
import { submitContactMessage } from "../controllers/contact.controller.js";
import { contactLimiter } from "../middleware/rateLimit.middleware.js";

const router = express.Router();

router.post("/", contactLimiter, submitContactMessage);

export default router;
