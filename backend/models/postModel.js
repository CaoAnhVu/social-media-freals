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
      type: [String], // Mảng các URL hình ảnh
      default: [],
    },
    video: {
      type: String,
      default: null,
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
        userProfilePic: {
          type: String,
        },
        username: {
          type: String,
        },
        img: {
          type: String,
        },
        createdAt: {
          type: Date,
          default: Date.now, // Thêm timestamp cho replies
        },
      },
    ],
    originalPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },
    repostedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reposts: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now, // Đảm bảo lưu chính xác timestamp
    },
    updatedAt: {
      type: Date,
      default: Date.now, // Thêm updatedAt theo dõi cập nhật
    },
    location: {
      name: {
        type: String,
        default: "No location specified",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [],
      },
    },
  },
  {
    timestamps: true, // Tự động quản lý createdAt và updatedAt
  }
);

const Post = mongoose.model("Post", postSchema);
postSchema.pre("save", function (next) {
  // Đảm bảo video là string hoặc null
  if (this.video !== null && typeof this.video !== "string") {
    this.video = null;
  }
  next();
});
export default Post;
