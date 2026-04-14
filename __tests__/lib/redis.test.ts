import { describe, it, expect, afterAll } from "vitest";

describe("Redis connection", () => {
  it("should connect and ping", async () => {
    const { redis } = await import("@/lib/redis");
    const result = await redis.ping();
    expect(result).toBe("PONG");
  });

  it("should set and get a value", async () => {
    const { redis } = await import("@/lib/redis");
    await redis.set("test:blini-home", "working");
    const value = await redis.get("test:blini-home");
    expect(value).toBe("working");
    await redis.del("test:blini-home");
  });

  afterAll(async () => {
    const { redis } = await import("@/lib/redis");
    await redis.quit();
  });
});
