import express, { response, Router } from "express";
import { followUnFollowUser, getUserProfile, loginUser, logoutUser, signupUser, searchUsers, updateUser, getSuggestedUsers, freezeAccount } from "../controllers/userController.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/profile/:query", getUserProfile);
router.get("/suggested", protectRoute, getSuggestedUsers);
router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/follow/:id", protectRoute, followUnFollowUser); // Toggle state(follow/unfollow)
router.get("/search", protectRoute, searchUsers);
router.put("/update/:id", protectRoute, updateUser);
router.put("/freeze", protectRoute, freezeAccount);
export default router;
