import mongoose from "mongoose";
import env from "./env";

const connectDB = async () => {
  if (!env.MONGODB_URI) {
    console.warn("MONGODB_URI is not defined. Check your .env file.");
    return false;
  }

  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB Connected");
    return true;
  } catch (error) {
    console.warn(
      "MongoDB is not available. Start MongoDB or update MONGODB_URI to enable database access.",
      error
    );
    return false;
  }
};

export default connectDB;