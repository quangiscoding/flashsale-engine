import { db } from "@/db";

async function init() {
  const client = await db.connect();

  try {
    console.log("⏳ Initializing database schema...");

    // Create products & orders tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        stock INT NOT NULL CHECK (stock >= 0)
      );

      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        product_id VARCHAR(50) REFERENCES products(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed test item (10 stock available)
    await client.query(`
      INSERT INTO products (id, name, stock)
      VALUES ('prod_999', 'Flash Sale iPhone', 10)
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log("✅ Database schema and seed data initialized!");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
  } finally {
    client.release();
    await db.end();
  }
}

init();
