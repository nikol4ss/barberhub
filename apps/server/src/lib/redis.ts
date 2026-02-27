import dotenv from "dotenv";
import Redis from "ioredis";

dotenv.config();

const redis = new Redis({
  host: process.env.REDIS_HOST?.trim() || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
});

export default redis;
