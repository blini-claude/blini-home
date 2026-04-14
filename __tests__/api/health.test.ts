import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/health/route";

describe("GET /api/health", () => {
  it("should return healthy status with all services", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("healthy");
    expect(body.services).toBeDefined();
    expect(body.services.database).toBe("ok");
    expect(body.services.redis).toBe("ok");
    expect(body.services.meilisearch).toBe("ok");
  });
});
