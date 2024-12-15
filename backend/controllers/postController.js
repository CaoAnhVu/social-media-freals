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
    const { postedBy, text, location } = req.body;
    let imgUrls = [];

    console.log("Files received:", req.files);

    // Xử lý nhiều ảnh
    if (req.files && req.files["img"]) {
      const imgFiles = Array.isArray(req.files["img"]) ? req.files["img"] : [req.files["img"]];
      console.log("Processing images:", imgFiles.length);

      // Upload tất cả các ảnh
      const uploadPromises = imgFiles.map(async (imgFile) => {
        try {
          const imgUpload = await cloudinary.uploader.upload(`data:${imgFile.mimetype};base64,${imgFile.buffer.toString("base64")}`, {
            resource_type: "image",
          });
          console.log("Uploaded image:", imgUpload.secure_url);
          return imgUpload.secure_url;
        } catch (error) {
          console.error("Error uploading image:", error);
          throw error;
        }
      });

      imgUrls = await Promise.all(uploadPromises);
      console.log("All uploaded image URLs:", imgUrls);
    }

    // Tạo bài đăng mới với mảng ảnh
    const newPost = new Post({
      postedBy,
      text,
      img: imgUrls,
      location: location ? JSON.parse(location) : null,
    });

    console.log("New post data:", {
      postedBy,
      text,
      imgUrls,
      location,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    console.error("Error in createPost:", err);
    res.status(500).json({ error: err.message });
  }
};

const getPost = async (req, res) => {
  try {
    // Tìm bài viết theo ID và sử dụng populate
    const post = await Post.findById(req.params.id).populate("postedBy", "username profilePic").populate("reposts", "username profilePic");

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.status(200).json(post); // Trả về dữ liệu bài viết
  } catch (err) {
    res.status(500).json({ error: err.message }); // Xử lý lỗi
  }
};

const deletePost = [
  verifyUserOwnership,
  async (req, res) => {
    try {
      // Lấy postId từ tham số đường dẫn
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      // Kiểm tra quyền sở hữu của người dùng đối với post
      if (post.postedBy.toString() !== req.user._id.toString()) {
        return res.status(401).json({ error: "Unauthorized to delete post" });
      }

      // Xóa các replies (hoặc comments) nếu có
      if (post.replies && post.replies.length > 0) {
        // Có thể xử lý thêm nếu cần, ví dụ: Xóa hoặc lưu các phản hồi vào một nơi khác
        post.replies = []; // Làm sạch mảng replies
      }

      // Xóa ảnh từ Cloudinary (nếu có)
      if (post.img && Array.isArray(post.img)) {
        // Xóa tất cả các ảnh từ Cloudinary
        const deletePromises = post.img.map(async (imgUrl) => {
          const imgId = imgUrl.split("/").pop().split(".")[0];
          try {
            await cloudinary.uploader.destroy(imgId);
          } catch (error) {
            console.error("Failed to delete image:", error);
          }
        });
        await Promise.all(deletePromises);
      }

      // Xóa video từ Cloudinary (nếu có)
      if (post.video) {
        const videoId = post.video.split("/").pop().split(".")[0];
        try {
          // Kiểm tra xem video có tồn tại trên Cloudinary không
          await cloudinary.uploader.destroy(videoId, { resource_type: "video" });
        } catch (error) {
          console.error("Failed to delete video:", error);
          return res.status(500).json({ error: "Failed to delete video from Cloudinary" });
        }
      }

      // Xóa bài đăng khỏi cơ sở dữ liệu
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
    let imgUrl = null;

    // Log để kiểm tra
    console.log("Request files:", req.files);
    console.log("Request body:", req.body);

    // Thêm validation độ dài text
    if (text.length > 500) {
      return res.status(400).json({ error: "Reply text must be less than 500 characters" });
    }

    if (!text) {
      return res.status(400).json({ error: "Text field is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Xử lý ảnh nếu có
    if (req.files && req.files["img"] && req.files["img"][0]) {
      try {
        const imgFile = req.files["img"][0];
        const imgUpload = await cloudinary.uploader.upload(`data:${imgFile.mimetype};base64,${imgFile.buffer.toString("base64")}`, {
          resource_type: "image",
          folder: "replies",
        });
        imgUrl = imgUpload.secure_url;
        console.log("Uploaded image URL:", imgUrl); // Log URL ảnh sau khi upload
      } catch (error) {
        console.error("Error uploading image:", error);
        return res.status(500).json({ error: "Error uploading image" });
      }
    }

    // Tạo reply mới với ảnh
    const reply = {
      userId,
      text,
      img: imgUrl, // Đảm bảo imgUrl được gán vào đây
      userProfilePic,
      username,
      createdAt: new Date(),
    };

    console.log("New reply object:", reply); // Log reply object trước khi lưu

    // Thêm reply vào post
    post.replies.push(reply);
    await post.save();

    // Log reply sau khi lưu
    console.log("Saved reply:", post.replies[post.replies.length - 1]);

    res.status(200).json(reply);
  } catch (err) {
    console.error("Error in replyToPost:", err);
    res.status(500).json({ error: err.message });
  }
};

const deleteReply = async (req, res) => {
  try {
    const { postId, replyId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Tìm reply cần xóa
    const replyIndex = post.replies.findIndex((reply) => reply._id.toString() === replyId && reply.userId.toString() === userId.toString());

    if (replyIndex === -1) {
      return res.status(403).json({ error: "Reply not found or you don't have permission to delete" });
    }

    // Xóa reply
    post.replies.splice(replyIndex, 1);
    await post.save();

    res.status(200).json({ message: "Reply deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const repostPost = async (req, res) => {
  try {
    const postId = req.params.id; // ID bài viết gốc
    const userId = req.user._id; // ID người dùng từ token

    // Tìm bài viết gốc
    const originalPost = await Post.findById(postId);
    if (!originalPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Kiểm tra nếu người dùng đã repost
    const hasReposted = originalPost.reposts.includes(userId);

    if (hasReposted) {
      // Nếu đã repost, thì gỡ repost
      originalPost.reposts = originalPost.reposts.filter((id) => id.toString() !== userId.toString());
      await originalPost.save();
      return res.status(200).json({ message: "Repost removed", post: originalPost });
    }

    // Nếu chưa repost, thêm vào danh sách repost
    originalPost.reposts.push(userId);

    // Tạo một bài viết mới (nếu cần lưu repost như bài viết riêng)
    const repost = await Post.create({
      content: originalPost.content, // Copy nội dung từ bài viết gốc
      postedBy: userId, // Gán người dùng đã repost
      originalPost: postId, // Gắn bài viết gốc
      isRepost: true, // Đánh dấu bài viết là repost
      repostedAt: new Date(), // Thời gian repost
    });

    await originalPost.save();

    res.status(201).json({ message: "Post reposted", repost });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const sharePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (post.sharedBy.includes(userId)) {
      return res.status(400).json({ error: "You have already shared this post" });
    }

    // Thêm userId vào danh sách sharedBy
    post.sharedBy.push(userId);
    await post.save();

    res.status(200).json({ message: "Post shared successfully", post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getFeedPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const following = user.following;
    const feedPosts = await Post.find({ postedBy: { $in: following } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

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

export { verifyUserOwnership, createPost, deletePost, getPost, likeUnlikePost, replyToPost, deleteReply, repostPost, sharePost, getFeedPosts, getUserPosts, upload, uploadVideoBlob };
