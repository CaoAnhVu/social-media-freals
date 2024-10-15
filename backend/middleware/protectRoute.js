const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookie.jwt;

    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const dec
  } catch (err) {
    res.status(500).json({ message: error.message });
    console.log("Error in loginUser:", error.message);
  }
};
