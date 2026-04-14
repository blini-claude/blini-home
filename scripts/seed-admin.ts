import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import pg from "pg";
import bcrypt from "bcryptjs";

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const db = new PrismaClient({ adapter });

  const email = process.env.ADMIN_EMAIL || "admin@blini.world";
  const password = process.env.ADMIN_PASSWORD || "blinihome2026";

  const hash = await bcrypt.hash(password, 12);

  const user = await db.adminUser.upsert({
    where: { email },
    update: { passwordHash: hash },
    create: { email, passwordHash: hash },
  });

  console.log(`Admin user ready: ${user.email} (id: ${user.id})`);

  await db.$disconnect();
  await pool.end();
}

main().catch(console.error);
