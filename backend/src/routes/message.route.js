import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getMessages,
  getUsersForSidebar,
  sendMessage,
  addContactByCode,
  clearChat,
  deleteMessage,
  removeContact,
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.post("/add-contact", protectRoute, addContactByCode);
router.delete("/contact/:id", protectRoute, removeContact);
router.delete("/clear/:id", protectRoute, clearChat);
router.delete("/message/:id", protectRoute, deleteMessage);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);

export default router;
