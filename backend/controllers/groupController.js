import Group from "../models/groupModel.js";
import User from "../models/userModel.js";

// Lấy danh sách nhóm
export const getGroups = async (req, res) => {
  try {
    const groups = await Group.find().populate("admin", "username profilePic").populate("members.user", "username profilePic");
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Tạo nhóm mới
export const createGroup = async (req, res) => {
  try {
    const { name, description, privacy } = req.body;
    const newGroup = new Group({
      name,
      description,
      privacy,
      admin: req.user._id,
      members: [{ user: req.user._id, role: "admin" }],
    });
    const savedGroup = await newGroup.save();
    res.status(201).json(savedGroup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Tham gia nhóm
export const joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ error: "Không tìm thấy nhóm" });
    }

    const isMember = group.members.some((member) => member.user.toString() === req.user._id.toString());

    if (isMember) {
      return res.status(400).json({ error: "Bạn đã là thành viên của nhóm này" });
    }

    group.members.push({ user: req.user._id, role: "member" });
    await group.save();

    res.status(200).json({ message: "Đã gửi yêu cầu tham gia" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Xử lý yêu cầu tham gia
export const handleJoinRequest = async (req, res) => {
  try {
    const res = await fetch(`/api/groups/${groupId}/request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    if (data.error) {
      showToast("Error", data.error, "error");
      return;
    }
    const { groupId, userId, action } = req.body;
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ error: "Không tìm thấy nhóm" });
    }

    if (action === "accept") {
      group.members.push({ user: userId, role: "member" });
      group.pendingRequests = group.pendingRequests.filter((request) => request.user.toString() !== userId);
    } else if (action === "reject") {
      group.pendingRequests = group.pendingRequests.filter((request) => request.user.toString() !== userId);
    }
    showToast("Success", "Đã gửi yêu cầu tham gia", "success");
    await group.save();
    res.status(200).json(group);
  } catch (error) {
    showToast("Error", error.message, "error");
  }
};

// Lấy chi tiết nhóm
export const getGroupDetails = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId).populate("admin", "username profilePic").populate("members.user", "username profilePic");

    if (!group) {
      return res.status(404).json({ error: "Không tìm thấy nhóm" });
    }

    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cập nhật thông tin nhóm
export const updateGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ error: "Không tìm thấy nhóm" });
    }

    if (group.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Bạn không có quyền cập nhật nhóm này" });
    }

    const updatedGroup = await Group.findByIdAndUpdate(req.params.groupId, { $set: req.body }, { new: true });

    res.status(200).json(updatedGroup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Xóa nhóm
export const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ error: "Không tìm thấy nhóm" });
    }

    if (group.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Bạn không có quyền xóa nhóm này" });
    }

    await Group.findByIdAndDelete(req.params.groupId);
    res.status(200).json({ message: "Đã xóa nhóm thành công" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Rời khỏi nhóm
export const leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ error: "Không tìm thấy nhóm" });
    }

    if (group.admin.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: "Admin không thể rời khỏi nhóm" });
    }

    group.members = group.members.filter((member) => member.user.toString() !== req.user._id.toString());

    await group.save();
    res.status(200).json({ message: "Đã rời khỏi nhóm thành công" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
