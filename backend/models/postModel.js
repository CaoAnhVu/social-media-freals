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
      type: String,
    },
    video: {
      type: String,
    },
    location: {
      name: { type: String, default: "" },
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
        userProfilePic: {
          type: String,
        },
        username: {
          type: String,
        },
      },
    ],
    reposts: {
      type: [mongoose.Schema.Types.ObjectId], // Danh sách người dùng đã repost bài viết
      ref: "User",
      default: [],
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
postSchema.index({ "location.coordinates": "2dsphere" });
const Post = mongoose.model("Post", postSchema);

export default Post;
