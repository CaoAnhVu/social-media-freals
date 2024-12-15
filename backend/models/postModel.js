import mongoose from "mongoose";

const postSchema = mongoose.Schema(
  {
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      maxLength: 500,
    },
    img: {
      type: [String],
      default: [],
    },
    video: {
      type: String,
    },
    location: {
      name: { type: String, default: null },
      coordinates: {
        type: [Number],
        index: "2dsphere",
        default: [],
      },
    },

    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },

    replies: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
        img: {
          // Đảm bảo trường img tồn tại
          type: String,
        },
        userProfilePic: {
          type: String,
        },
        username: {
          type: String,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    reposts: {
      type: [mongoose.Schema.Types.ObjectId], // Danh sách người dùng đã repost bài viết
      ref: "User",
      default: [],
    },

    isRepost: {
      type: Boolean,
      default: false, // Đánh dấu bài viết là repost
    },
    originalPost: {
      type: mongoose.Schema.Types.ObjectId, // Bài viết gốc nếu là repost
      ref: "Post",
      default: null,
    },

    sharedBy: {
      type: [mongoose.Schema.Types.ObjectId], // Danh sách người dùng đã share bài viết
      ref: "User",
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Tạo chỉ mục địa lý cho trường "location"
postSchema.index({ "location.coordinates": "2dsphere" });

const Post = mongoose.model("Post", postSchema);

export default Post;
