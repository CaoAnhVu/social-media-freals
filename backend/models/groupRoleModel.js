// models/groupRoleModel.js
import mongoose from "mongoose";
const roleSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  permissions: [
    {
      type: String,
      enum: ["manage_members", "create_posts", "delete_posts", "create_events", "manage_files", "send_announcements"],
    },
  ],
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
  },
});
const GroupRole = mongoose.model("GroupRole", roleSchema); // Thiếu export model
export default GroupRole;
