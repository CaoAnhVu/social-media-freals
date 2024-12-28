import User from "../models/userModel.js";
import jwt from "jsonwebtoken"; // Ensure you import jwt

const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt; // Fixed: req.cookie should be req.cookies
    console.log("Token:", token); // Log token

    if (!token) {
      console.log("No token provided"); // Log khi không có token
      return res.status(401).json({ message: "Vui lòng đăng nhập" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded); // Log dữ liệu giải mã token

    const user = await User.findById(decoded.userId).select("-password");
    console.log("User Found:", user); // Log thông tin người dùng

    req.user = user;
    next();
  } catch (err) {
    console.log("Error in protectRoute:", err.message); // Log lỗi
    res.status(500).json({ message: err.message });
  }
};

export default protectRoute;
