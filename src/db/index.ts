import pg from "pg";
import { config } from "@/config";

export const db = new pg.Pool({
  connectionString: config.postgresUrl,
  max: 20, // Max concurrent DB connections in pool
  idleTimeoutMillis: 30000, // Close idle clients after 30s
  connectionTimeoutMillis: 2000,
});
