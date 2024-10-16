import User from "../models/userModel.js";
import jwt from "jsonwebtoken"; // Ensure you import jwt

const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt; // Fixed: req.cookie should be req.cookies

    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    req.user = user;

    next();
  } catch (err) {
    res.status(500).json({ message: err.message }); // Use 'err' instead of 'error'
    console.log("Error in protectRoute:", err.message); // Use 'err' instead of 'error'
  }
};

export default protectRoute;
