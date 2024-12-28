// models/groupPostModel.js
import mongoose from "mongoose";

const groupPostSchema = mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    media: [
      {
        type: String, // URL của ảnh/video
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        content: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ["active", "hidden", "deleted"],
      default: "active",
    },

    // Thêm trường để phân loại bài viết
    type: {
      type: String,
      enum: ["normal", "announcement", "event"],
      default: "normal",
    },
  },
  {
    timestamps: true,
  }
);
