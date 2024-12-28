import express from "express";
import { getGroups, createGroup, getGroupDetails, joinGroup, leaveGroup, updateGroup, deleteGroup, handleJoinRequest } from "../controllers/groupController.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/all", getGroups); // Lấy danh sách nhóm
router.post("/create", protectRoute, createGroup); // Tạo nhóm mới
router.get("/:id", getGroupDetails); // Lấy chi tiết nhóm
router.post("/:id/join", protectRoute, joinGroup); // Tham gia nhóm
router.put("/:id", protectRoute, updateGroup); // Cập nhật thông tin nhóm
router.delete("/:id", protectRoute, deleteGroup); // Xóa nhóm
router.post("/:id/leave", protectRoute, leaveGroup); // Rời khỏi nhóm
// Xử lý yêu cầu tham gia
router.post("/:id/request", protectRoute, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ error: "Không tìm thấy nhóm" });
    }

    // Kiểm tra xem người dùng đã gửi yêu cầu chưa
    const alreadyRequested = group.pendingRequests.some((request) => request.user.toString() === req.user._id.toString());

    if (alreadyRequested) {
      return res.status(400).json({ error: "Bạn đã gửi yêu cầu tham gia nhóm này rồi" });
    }

    // Thêm yêu cầu mới
    group.pendingRequests.push({
      user: req.user._id,
      requestedAt: new Date(),
    });

    await group.save();
    res.status(200).json({ message: "Đã gửi yêu cầu tham gia" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route xử lý chấp nhận/từ chối yêu cầu (chỉ admin/moderator mới có quyền)
router.post("/:id/handle-request", protectRoute, async (req, res) => {
  try {
    const { userId, action } = req.body; // action: 'accept' hoặc 'reject'
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ error: "Không tìm thấy nhóm" });
    }

    // Kiểm tra quyền (chỉ admin hoặc moderator mới có thể xử lý yêu cầu)
    const isAdmin = group.admin.toString() === req.user._id.toString();
    const isModerator = group.moderators.some((mod) => mod.toString() === req.user._id.toString());

    if (!isAdmin && !isModerator) {
      return res.status(403).json({ error: "Bạn không có quyền xử lý yêu cầu này" });
    }

    // Xử lý yêu cầu
    if (action === "accept") {
      // Thêm người dùng vào nhóm
      group.members.push({
        user: userId,
        role: "member",
        joinedAt: new Date(),
      });
      // Xóa khỏi danh sách yêu cầu đang chờ
      group.pendingRequests = group.pendingRequests.filter((request) => request.user.toString() !== userId);
    } else if (action === "reject") {
      // Chỉ xóa khỏi danh sách yêu cầu đang chờ
      group.pendingRequests = group.pendingRequests.filter((request) => request.user.toString() !== userId);
    }

    await group.save();
    res.status(200).json({
      message: action === "accept" ? "Đã chấp nhận yêu cầu" : "Đã từ chối yêu cầu",
      group,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route để lấy danh sách yêu cầu đang chờ
router.get("/:id/pending-requests", protectRoute, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate("pendingRequests.user", "username profilePic");

    if (!group) {
      return res.status(404).json({ error: "Không tìm thấy nhóm" });
    }

    // Kiểm tra quyền
    const isAdmin = group.admin.toString() === req.user._id.toString();
    const isModerator = group.moderators.some((mod) => mod.toString() === req.user._id.toString());

    if (!isAdmin && !isModerator) {
      return res.status(403).json({ error: "Bạn không có quyền xem danh sách này" });
    }

    res.status(200).json(group.pendingRequests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
