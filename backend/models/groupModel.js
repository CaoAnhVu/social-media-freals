// backend/models/groupModel.js
import mongoose from "mongoose";

const groupSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      default: "",
    },
    coverImage: {
      type: String,
      default: "",
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    moderators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: ["admin", "moderator", "member"],
          default: "member",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    privacy: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    pendingRequests: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        requestedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    rules: [
      {
        title: String,
        description: String,
      },
    ],
    events: [
      {
        title: String,
        description: String,
        date: Date,
        participants: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        ],
      },
    ],
    tags: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
    chats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GroupChat",
      },
    ],
    files: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GroupFile",
      },
    ],
    polls: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GroupPoll",
      },
    ],
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GroupRole",
      },
    ],
    notifications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GroupNotification",
      },
    ],
  },
  {
    timestamps: true,
  }
);
// Middleware trước khi xóa group
groupSchema.pre("remove", async function (next) {
  await GroupChat.deleteMany({ group: this._id });
  await GroupPost.deleteMany({ group: this._id });
  // Xóa các dữ liệu liên quan khác
  next();
});

// Middleware trước khi lưu
groupSchema.pre("save", function (next) {
  // Thực hiện một số tác vụ trước khi lưu
  next();
});
// Thêm methods
groupSchema.methods.isMember = function (userId) {
  return this.members.some((member) => member.user.toString() === userId.toString());
};

groupSchema.methods.isAdmin = function (userId) {
  return this.admin.toString() === userId.toString();
};

// Thêm statics
groupSchema.statics.findByName = function (name) {
  return this.findOne({ name });
};
groupSchema.index({ name: 1 }); // Index cho trường name
groupSchema.index({ "members.user": 1 }); // Index cho trường members.user
groupSchema.index({ admin: 1 }); // Index cho trường admin
const Group = mongoose.model("Group", groupSchema);
export default Group;
