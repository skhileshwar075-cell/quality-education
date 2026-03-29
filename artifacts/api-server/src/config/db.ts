import mongoose from "mongoose";
import { logger } from "../lib/logger.js";

export async function connectDB() {
  const uri = process.env["MONGODB_URI"];
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is required");
  }
  try {
    await mongoose.connect(uri);
    logger.info("MongoDB connected");
  } catch (err) {
    logger.error({ err }, "MongoDB connection error");
    process.exit(1);
  }
}
