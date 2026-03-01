import { config } from "dotenv";
config({ path: ".env.local" });
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function seed() {
  const client = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });
  const db = drizzle(client);

  const hash = await bcrypt.hash("admin123", 12);

  // Upsert admin user with hashed password
  await db.run(
    sql`INSERT INTO user (id, name, email, hashedPassword)
        VALUES ('admin', 'Admin', 'admin@shelf.dev', ${hash})
        ON CONFLICT(id) DO UPDATE SET hashedPassword = ${hash}`
  );

  console.log("Seed complete. Admin user: admin@shelf.dev / admin123");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
