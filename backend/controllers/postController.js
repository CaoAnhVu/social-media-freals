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
    let videoUrl = null;

    // Xử lý upload nhiều ảnh
    if (req.files && req.files["img"]) {
      const imgFiles = Array.isArray(req.files["img"]) ? req.files["img"] : [req.files["img"]];

      for (const file of imgFiles) {
        const result = await cloudinary.uploader.upload(`data:${file.mimetype};base64,${file.buffer.toString("base64")}`, { resource_type: "image" });
        imgUrls.push(result.secure_url);
      }
    }

    // Xử lý upload video
    if (req.files && req.files["video"]) {
      const videoFile = Array.isArray(req.files["video"]) ? req.files["video"][0] : req.files["video"];

      const result = await cloudinary.uploader.upload(`data:${videoFile.mimetype};base64,${videoFile.buffer.toString("base64")}`, {
        resource_type: "video",
        chunk_size: 6000000,
        timeout: 120000,
      });
      videoUrl = result.secure_url;
    }

    const newPost = new Post({
      postedBy,
      text,
      img: imgUrls,
      video: videoUrl,
      location: location ? JSON.parse(location) : null,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// const createPost = async (req, res) => {
//   try {
//     const { postedBy, text, location } = req.body;
//     let imgUrls = [];

//     console.log("Files received:", req.files);

//     // Xử lý nhiều ảnh
//     if (req.files && req.files["img"]) {
//       const imgFiles = Array.isArray(req.files["img"]) ? req.files["img"] : [req.files["img"]];
//       console.log("Processing images:", imgFiles.length);

//       // Upload tất cả các ảnh
//       const uploadPromises = imgFiles.map(async (imgFile) => {
//         try {
//           const imgUpload = await cloudinary.uploader.upload(`data:${imgFile.mimetype};base64,${imgFile.buffer.toString("base64")}`, {
//             resource_type: "image",
//           });
//           console.log("Uploaded image:", imgUpload.secure_url);
//           return imgUpload.secure_url;
//         } catch (error) {
//           console.error("Error uploading image:", error);
//           throw error;
//         }
//       });

//       imgUrls = await Promise.all(uploadPromises);
//       console.log("All uploaded image URLs:", imgUrls);
//     }

//     // Tạo bài đăng mới với mảng ảnh
//     const newPost = new Post({
//       postedBy,
//       text,
//       img: imgUrls,
//       location: location ? JSON.parse(location) : null,
//     });

//     console.log("New post data:", {
//       postedBy,
//       text,
//       imgUrls,
//       location,
//     });

//     await newPost.save();
//     res.status(201).json(newPost);
//   } catch (err) {
//     console.error("Error in createPost:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

const getPost = async (req, res) => {
  try {
    // Tìm bài viết theo ID và sử dụng populate
    const post = await Post.findById(req.params.id)
      // .populate("postedBy", "username profilePic").populate("reposts", "username profilePic");
      .populate("postedBy")
      .populate("likes")
      .populate({
        path: "replies",
        populate: {
          path: "userId",
          select: "-password",
        },
      });
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

const getUserReplies = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // Tìm tất cả posts có replies của user và không phải của chính user đó
    const posts = await Post.find({
      $and: [{ "replies.userId": user._id }, { postedBy: { $ne: user._id } }],
    })
      .populate("postedBy", "username profilePic name")
      .select("text img video likes replies reposts shares createdAt postedBy"); // Đảm bảo select video
    const userReplies = [];
    posts.forEach((post) => {
      // Lọc replies của user trong mỗi post
      const postReplies = post.replies.filter((reply) => reply.userId.toString() === user._id.toString());
      postReplies.forEach((reply) => {
        // Xử lý media cho originalPost
        const processedPost = {
          _id: post._id,
          text: post.text,
          img: Array.isArray(post.img) ? post.img : post.img ? [post.img] : [], // Đảm bảo img là mảng
          video: post.video || null, // Xử lý video
          postedBy: post.postedBy,
          createdAt: post.createdAt,
          likes: post.likes || [],
          replies: post.replies || [],
          reposts: post.reposts || [],
          shares: post.shares || [],
        };
        userReplies.push({
          _id: reply._id,
          text: reply.text,
          img: reply.img,
          createdAt: reply.createdAt,
          userId: user._id,
          username: reply.username,
          userProfilePic: reply.userProfilePic,
          likes: reply.likes || [],
          replies: reply.replies || [],
          originalPost: processedPost, // Sử dụng processedPost đã xử lý
        });
      });
    });
    // Sắp xếp theo thời gian mới nhất
    userReplies.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    // Log để kiểm tra
    console.log(
      "Processed user replies:",
      userReplies.map((reply) => ({
        ...reply,
        originalPost: {
          ...reply.originalPost,
          video: reply.originalPost.video, // Kiểm tra video
        },
      }))
    );
    res.status(200).json(userReplies);
  } catch (err) {
    console.error("Error in getUserReplies:", err);
    res.status(500).json({ error: err.message });
  }
};
const repostPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const originalPost = await Post.findById(postId);
    if (!originalPost) {
      return res.status(404).json({ error: "Bài viết không tồn tại" });
    }
    // Kiểm tra xem user đã repost bài này chưa
    const hasReposted = originalPost.reposts.includes(userId);
    if (hasReposted) {
      // Nếu đã repost thì xóa repost
      originalPost.reposts = originalPost.reposts.filter((id) => id.toString() !== userId.toString());
      await originalPost.save();
      return res.status(200).json({
        message: "Repost removed",
        post: originalPost,
      });
    }
    // Thêm userId vào mảng reposts của bài gốc
    originalPost.reposts.push(userId);
    await originalPost.save();
    // Populate thông tin cần thiết và trả về
    const populatedPost = await Post.findById(postId).populate("postedBy", "username profilePic name").populate("reposts", "username profilePic name");
    res.status(200).json({
      message: "Post reposted successfully",
      post: populatedPost,
    });
  } catch (error) {
    console.error("Error in repostPost:", error);
    res.status(500).json({ error: error.message });
  }
};
// Hàm lấy danh sách bài viết đã repost của user
const getUserReposts = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // Tìm tất cả bài viết có userId trong mảng reposts
    const repostedPosts = await Post.find({
      reposts: user._id,
    })
      .populate("postedBy", "name username profilePic") // Populate thông tin người đăng bài gốc
      .populate("reposts", "name username profilePic") // Populate thông tin người repost
      .sort({ createdAt: -1 });
    // Format lại dữ liệu để phù hợp với giao diện
    const formattedReposts = repostedPosts.map((post) => ({
      _id: post._id,
      text: post.text,
      img: post.img,
      video: post.video,
      likes: post.likes,
      replies: post.replies,
      originalPost: {
        _id: post._id,
        text: post.text,
        img: post.img,
        video: post.video,
        postedBy: post.postedBy,
        createdAt: post.createdAt,
        likes: post.likes,
        replies: post.replies,
      },
      repostedBy: {
        _id: user._id,
        username: user.username,
        name: user.name,
        profilePic: user.profilePic,
      },
      repostedAt: post.updatedAt,
      createdAt: post.createdAt,
    }));
    // Log để debug
    console.log("Found reposts:", formattedReposts);
    res.status(200).json(formattedReposts);
  } catch (error) {
    console.error("Error in getUserReposts:", error);
    res.status(500).json({ error: error.message });
  }
};
const removeRepost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;
    console.log("Removing repost:", { postId, userId });
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Bài viết không tồn tại" });
    }
    // Xóa userId khỏi mảng reposts
    post.reposts = post.reposts.filter((id) => id.toString() !== userId.toString());
    await post.save();
    res.status(200).json({
      message: "Đã xóa bài đăng lại thành công",
      post,
    });
  } catch (error) {
    console.error("Error in removeRepost:", error);
    res.status(500).json({ error: error.message });
  }
};
export {
  verifyUserOwnership,
  createPost,
  deletePost,
  getPost,
  likeUnlikePost,
  replyToPost,
  deleteReply,
  repostPost,
  getUserReposts,
  removeRepost,
  sharePost,
  getFeedPosts,
  getUserPosts,
  getUserReplies,
  upload,
  uploadVideoBlob,
};
