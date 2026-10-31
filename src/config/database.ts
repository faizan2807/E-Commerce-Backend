import mongoose from "mongoose";
import env from "./env";

const connectDB = async () => {
  if (!env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined. Configure it in the deployment environment.");
  }

  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB Connected");
  } catch (error) {
    throw new Error("MongoDB connection failed. Check MONGODB_URI and database network access.", {
      cause: error,
    });
  }
};

export default connectDB;