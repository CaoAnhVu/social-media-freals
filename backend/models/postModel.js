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
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // ID của người được tag
      },
    ],
    attachments: [
      {
        fileUrl: String, // URL của tệp đính kèm
        fileType: String, // Loại tệp (ví dụ: image, pdf, ...)
      },
    ],
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
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
