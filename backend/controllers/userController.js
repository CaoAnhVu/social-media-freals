import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import generateTokenAndSetCookie from "../utils/helpers/generateTokenAndSetCookie.js";

//Get User Profile
const getUserProfile = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username }).select("-password").select("-updateAt");
    if (!user) return res.status(400).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
    console.log("Error in getUserProfile:", err.message);
  }
};

//signup user
const signupUser = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;

    // Validate required fields
    if (!name || !email || !username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists (by email or username)
    const user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new User({
      name,
      email,
      username,
      password: hashedPassword,
    });

    // Save the new user to the database
    await newUser.save();

    // Respond with success if user is created
    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);

      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (err) {
    // Log the error and send a generic message to the client
    console.error("Error in signupUser:", err.message);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

//login user
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");
    if (!user || !isPasswordCorrect) return res.status(400).json({ message: " Invalid username or password" });
    generateTokenAndSetCookie(user._id, res);
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log("Error in loginUser:", error.message);
  }
};
//logout User

const logoutUser = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 1 });
    res.status(200).json({ message: " User logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: error.message });
    console.log("Error in loginUser:", error.message);
  }
};

//follow/UnfollowUser
const followUnFollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (id === req.user._id.toString()) return res.status(400).json({ error: "You cannot follow/unfollow yourself" });

    if (!userToModify || !currentUser) return res.status(400).json({ error: "User not found" });

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // Unfollow user
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      res.status(200).json({ message: "User unfollowed successfully" });
    } else {
      // Follow user
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
      res.status(200).json({ message: "User followed successfully" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in followUnFollowUser: ", err.message);
  }
};

//Update User

const updateUser = async (req, res) => {
  const { name, email, username, password, bio } = req.body;
  let { profilePic } = req.body;

  const userId = req.user._id;
  try {
    let user = await User.findById(userId);
    if (!user) return res.status(400).json({ error: "User not found" });

    if (req.params.id !== userId.toString()) return res.status(400).json({ error: "You cannot update other user's profile" });

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
    }

    if (profilePic) {
      if (user.profilePic) {
        await cloudinary.uploader.destroy(user.profilePic.split("/").pop().split(".")[0]);
      }

      const uploadedResponse = await cloudinary.uploader.upload(profilePic);
      profilePic = uploadedResponse.secure_url;
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.username = username || user.username;
    user.profilePic = profilePic || user.profilePic;
    user.bio = bio || user.bio;

    user = await user.save();

    // Find all posts that this user replied and update username and userProfilePic fields
    // await Post.updateMany(
    //   { "replies.userId": userId },
    //   {
    //     $set: {
    //       "replies.$[reply].username": user.username,
    //       "replies.$[reply].userProfilePic": user.profilePic,
    //     },
    //   },
    //   { arrayFilters: [{ "reply.userId": userId }] }
    // );

    // // password should be null in response
    // user.password = null;

    res.status(200).json({ message: "Profile update successfully", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in updateUser: ", err.message);
  }
};

export { signupUser, loginUser, logoutUser, followUnFollowUser, updateUser, getUserProfile };
