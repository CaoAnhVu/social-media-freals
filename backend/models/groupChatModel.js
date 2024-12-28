// models/groupChatModel.js
import mongoose from "mongoose"; // Thiếu import mongoose

const groupChatSchema = mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        content: String,
        type: {
          type: String,
          enum: ["text", "image", "file"],
          default: "text",
        },
        readBy: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        ],
      },
    ],
    deletedBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        deletedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);
const GroupChat = mongoose.model("GroupChat", groupChatSchema);
export default GroupChat;
