import { db } from "@/db";

async function seed() {
  try {
    const { rows } = await db.query<{ id: string; sku: string; stock: number }>(
      `INSERT INTO products (sku, name, stock)
       VALUES ($1, $2, $3)
       ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock
       RETURNING id, sku, stock;`,
      ["prod_999", "Flash Sale iPhone", 10],
    );

    console.log("🌱 Seeded flash sale product:", rows[0]);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

seed();
