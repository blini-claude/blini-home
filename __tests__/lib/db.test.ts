import { describe, it, expect } from "vitest";

describe("Database connection", () => {
  it("should have DATABASE_URL defined", () => {
    expect(process.env.DATABASE_URL).toBeDefined();
  });

  it("should connect and query", async () => {
    const { db } = await import("@/lib/db");
    const result = await db.$queryRaw<{ now: Date }[]>`SELECT NOW() as now`;
    expect(result).toHaveLength(1);
    expect(result[0].now).toBeInstanceOf(Date);
    await db.$disconnect();
  });
});
