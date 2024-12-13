import multer from "multer";
import express from "express";
import { uploadVideoBlob, createPost, deletePost, getFeedPosts, getPost, getUserPosts, likeUnlikePost, replyToPost, deleteReply, repostPost, sharePost } from "../controllers/postController.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();
const storage = multer.memoryStorage();
const uploadMiddleware = multer({ storage: storage });

// Endpoint để nhận video upload
router.post("/uploadVideo", uploadMiddleware.single("video"), uploadVideoBlob);

router.post(
  "/create",
  uploadMiddleware.fields([
    { name: "img", maxCount: 10 },
    { name: "video", maxCount: 5 },
  ]),
  protectRoute,
  createPost
);

router.get("/user/:username", getUserPosts);
router.get("/feed", protectRoute, getFeedPosts);
router.get("/:id", getPost);
router.delete("/:id", protectRoute, deletePost);
router.put("/like/:id", protectRoute, likeUnlikePost);
router.put("/reply/:id", protectRoute, uploadMiddleware.fields([{ name: "img", maxCount: 1 }]), replyToPost);
router.delete("/reply/:postId/:replyId", protectRoute, deleteReply);
router.post("/repost/:id", protectRoute, repostPost);
router.put("/share/:id", protectRoute, sharePost);

export default router;
