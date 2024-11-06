import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const verifyUserOwnership = async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  req.user = user;
  next();
};
const uploadVideoBlob = async (videoBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ resource_type: "video" }, (error, result) => {
      if (error) return reject(error);
      resolve(result.secure_url);
    });
    stream.end(videoBuffer); // Đẩy buffer lên Cloudinary qua stream
  });
};
const createPost = async (req, res) => {
  try {
    const { postedBy, text } = req.body;
    let { img } = req.body;
    let videoUrl;

    if (!postedBy || !text) {
      return res.status(400).json({ error: "postedBy and text fields are required" });
    }

    // Kiểm tra độ dài văn bản
    const maxLength = 500;
    if (text.length > maxLength) {
      return res.status(400).json({ error: `Text must be less than ${maxLength} characters` });
    }

    // Tải lên hình ảnh nếu có
    if (img && typeof img === "string") {
      try {
        const uploadedImage = await cloudinary.uploader.upload(img);
        img = uploadedImage.secure_url;
      } catch (error) {
        return res.status(500).json({ error: "Failed to upload image" });
      }
    }

    // Tải lên video từ buffer nếu có
    if (req.file) {
      try {
        videoUrl = await uploadVideoBlob(req.file.buffer);
      } catch (error) {
        return res.status(500).json({ error: "Failed to upload video" });
      }
    }

    // Tạo post mới
    const newPost = new Post({ postedBy, text, img, video: videoUrl });
    await newPost.save();

    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deletePost = [
  verifyUserOwnership,
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      if (post.postedBy.toString() !== req.user._id.toString()) {
        return res.status(401).json({ error: "Unauthorized to delete post" });
      }

      // Xóa ảnh và video từ Cloudinary nếu có
      if (post.img) {
        try {
          const imgId = post.img.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(imgId);
        } catch (error) {
          console.error("Failed to delete image:", error);
        }
      }
      if (post.video) {
        try {
          const videoId = post.video.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(videoId, { resource_type: "video" });
        } catch (error) {
          console.error("Failed to delete video:", error);
        }
      }

      await Post.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "Post deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
];
const likeUnlikePost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const userLikedPost = post.likes.includes(userId);

    if (userLikedPost) {
      // Unlike post
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      res.status(200).json({ message: "Post unliked successfully" });
    } else {
      // Like post
      post.likes.push(userId);
      await post.save();
      res.status(200).json({ message: "Post liked successfully" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const replyToPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;
    const userProfilePic = req.user.profilePic;
    const username = req.user.username;

    if (!text) {
      return res.status(400).json({ error: "Text field is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const reply = { userId, text, userProfilePic, username };

    post.replies.push(reply);
    await post.save();

    res.status(200).json(reply);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getFeedPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query; // Phân trang: page và limit

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const following = user.following;
    const feedPosts = await Post.find({ postedBy: { $in: following } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit) // Bỏ qua số lượng bài viết đã hiển thị
      .limit(limit); // Giới hạn số lượng bài viết

    res.status(200).json(feedPosts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUserPosts = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const posts = await Post.find({ postedBy: user._id }).sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { verifyUserOwnership, createPost, deletePost, getPost, likeUnlikePost, replyToPost, getFeedPosts, getUserPosts, upload, uploadVideoBlob };
