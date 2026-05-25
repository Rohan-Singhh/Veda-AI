import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/vedaai",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  openRouterApiKey: process.env.OPENROUTER_API_KEY || "",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
};
