import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { meili } from "@/lib/meilisearch";

export async function GET() {
  const services: Record<string, string> = {};

  try {
    await db.$queryRaw`SELECT 1`;
    services.database = "ok";
  } catch {
    services.database = "error";
  }

  try {
    const pong = await redis.ping();
    services.redis = pong === "PONG" ? "ok" : "error";
  } catch {
    services.redis = "error";
  }

  try {
    const health = await meili.health();
    services.meilisearch = health.status === "available" ? "ok" : "error";
  } catch {
    services.meilisearch = "error";
  }

  const allHealthy = Object.values(services).every((s) => s === "ok");

  return NextResponse.json(
    { status: allHealthy ? "healthy" : "degraded", services },
    { status: allHealthy ? 200 : 503 }
  );
}
