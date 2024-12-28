// routes/groupFeatureRoutes.js
import express from "express";
import {
  createGroupPost,
  getGroupPosts,
  // ... other controllers
} from "../controllers/groupPostController.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

// Post routes
router.post("/posts", protectRoute, createGroupPost);
router.get("/posts/:groupId", protectRoute, getGroupPosts);

// Event routes
router.post("/events", protectRoute, createEvent);
router.get("/events/:groupId", protectRoute, getGroupEvents);

// Poll routes
router.post("/polls", protectRoute, createPoll);
router.put("/polls/:pollId/vote", protectRoute, votePoll);

export default router;
