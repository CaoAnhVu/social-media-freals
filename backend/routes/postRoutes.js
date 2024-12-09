import multer from "multer";
import express from "express";
import { uploadVideoBlob, createPost, deletePost, getFeedPosts, getPost, getUserPosts, likeUnlikePost, replyToPost, deleteReply, repostPost, sharePost } from "../controllers/postController.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();
const storage = multer.memoryStorage();
const uploadMiddleware = multer({ storage: storage });

// Endpoint để nhận video upload
router.post("/uploadVideo", uploadMiddleware.single("video"), uploadVideoBlob);

router.get("/user/:username", getUserPosts);
router.get("/feed", protectRoute, getFeedPosts);
router.get("/:id", getPost);
router.post(
  "/create",
  uploadMiddleware.fields([
    { name: "img", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  protectRoute,
  createPost
);
router.delete("/:id", protectRoute, deletePost);
router.patch("/like/:id", protectRoute, likeUnlikePost);
router.patch("/reply/:id", protectRoute, uploadMiddleware.fields([{ name: "img", maxCount: 1 }]), replyToPost);
router.delete("/reply/:postId/:replyId", protectRoute, deleteReply);
router.patch("/repost/:id", protectRoute, repostPost);
router.patch("/share/:id", protectRoute, sharePost);

export default router;
