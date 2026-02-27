import Redis from "ioredis";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

let redis: Redis;

describe("test-unit(Redis): Connection", () => {
  beforeAll(() => {
    redis = new Redis({
      host: process.env.REDIS_HOST?.trim() || "127.0.0.1",
      port: Number(process.env.REDIS_PORT) || 6379,
    });
  });

  afterAll(async () => {
    await redis.quit();
  });

  it("Redis being connected", async () => {
    const pong = await redis.ping();
    expect(pong).toBe("PONG");
  });

  it("Redis being tested with keys", async () => {
    await redis.set(
      "Vitest-Key",
      "The setup to obtain the key was successful.",
    );

    const value = await redis.get("Vitest-Key");
    expect(value).toBe("The setup to obtain the key was successful.");
  });
});
