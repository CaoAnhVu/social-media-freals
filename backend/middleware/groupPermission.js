// middleware/groupPermission.js
import Group from "../models/groupModel.js";

export const checkGroupPermission = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.groupId);
    const member = group.members.find((m) => m.user.toString() === req.user._id.toString());

    if (!member) {
      return res.status(403).json({
        error: "Bạn không có quyền truy cập nhóm này",
      });
    }

    req.userRole = member.role;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
