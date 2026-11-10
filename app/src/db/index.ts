import pg from "pg";

const POSTGRES_URL = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/flashsale";

export const db = new pg.Pool({
  connectionString: POSTGRES_URL,
  max: 20, // Max concurrent DB connections in pool
  idleTimeoutMillis: 30000, // Close idle clients after 30s
  connectionTimeoutMillis: 2000,
});
