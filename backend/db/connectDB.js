import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const MONGO_URL = process.env.MONGO_URL;
    console.log(`MongoDB URL: ${MONGO_URL}`);

    if (!MONGO_URL) {
      throw new Error("MongoDB connection string is missing in environment variables");
    }

    await mongoose.connect(MONGO_URL); // No need for deprecated options

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1); // Exit the process if connection fails
  }
};

export default connectDB;
