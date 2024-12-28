// models/groupFileModel.js
import mongoose from "mongoose";
const fileSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["document", "image", "video", "other"],
    },
    size: Number,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
  },
  {
    timestamps: true,
  }
);
const GroupFile = mongoose.model("GroupFile", fileSchema); // Thiếu export model
export default GroupFile;
