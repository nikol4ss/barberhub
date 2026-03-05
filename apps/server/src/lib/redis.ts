import "dotenv/config";
import Redis from "ioredis";

const host = process.env.REDIS_HOST;
const port = Number(process.env.REDIS_PORT);

if (!host) {
  throw new Error("REDIS_HOST is not found.");
}

if (!port || Number.isNaN(port)) {
  throw new Error("REDIS_PORT is not found.");
}

const redis = new Redis({
  host: host.trim(),
  port,
});

export default redis;
