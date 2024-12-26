import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { getMessages, sendMessage, deleteMessage, getConversations } from "../controllers/messageController.js";

const router = express.Router();

router.get("/conversations", protectRoute, getConversations);
router.get("/:otherUserId", protectRoute, getMessages);
router.post("/", protectRoute, sendMessage);
router.delete("/:id", protectRoute, deleteMessage);

export default router;
