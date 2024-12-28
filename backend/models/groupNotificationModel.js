// models/groupNotificationModel.js
import mongoose from "mongoose";
const notificationSchema = mongoose.Schema({
  type: {
    type: String,
    enum: ["new_post", "new_member", "event", "announcement"],
    required: true,
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  content: String,
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const GroupNotification = mongoose.model("GroupNotification", notificationSchema); // Thiếu export model
export default GroupNotification;
