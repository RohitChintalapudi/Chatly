import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { validateObjectId } from "../middleware/validateObjectId.middleware.js";
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
const validId = validateObjectId();

router.get("/users", protectRoute, getUsersForSidebar);
router.post("/add-contact", protectRoute, addContactByCode);
router.delete("/contact/:id", protectRoute, validId, removeContact);
router.delete("/clear/:id", protectRoute, validId, clearChat);
router.delete("/message/:id", protectRoute, validId, deleteMessage);
router.get("/:id", protectRoute, validId, getMessages);
router.post("/send/:id", protectRoute, validId, sendMessage);

export default router;
