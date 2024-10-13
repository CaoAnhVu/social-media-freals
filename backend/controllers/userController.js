import User from "../models/userModel.js";
import bcrypt from "bcryptjs";

const signupUser = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;

    // Validate required fields
    if (!name || !email || !username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists (by email or username)
    const user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new User({
      name,
      email,
      username,
      password: hashedPassword,
    });

    // Save the new user to the database
    await newUser.save();

    // Respond with success if user is created
    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      username: newUser.username,
    });
  } catch (err) {
    // Log the error and send a generic message to the client
    console.error("Error in signupUser:", err.message);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

export { signupUser };
