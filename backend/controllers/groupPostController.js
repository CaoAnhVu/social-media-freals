// controllers/groupPostController.js
import GroupPost from "../models/groupPostModel.js";
import mongoose from "mongoose";
export const createGroupPost = async (req, res) => {
  try {
    const { content, groupId } = req.body;

    // Kiểm tra groupId có phải là ObjectId hợp lệ
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ error: "ID nhóm không hợp lệ" });
    }

    const newPost = new GroupPost({
      content,
      group: groupId,
      author: req.user._id,
    });
    await newPost.save();

    const populatedPost = await newPost.populate("author", "username profilePic");
    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getGroupPosts = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Kiểm tra groupId có phải là ObjectId hợp lệ
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ error: "ID nhóm không hợp lệ" });
    }

    const posts = await GroupPost.find({ group: groupId }).populate("author", "username profilePic").populate("comments.user", "username profilePic").sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
