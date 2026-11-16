import { readFileSync } from "node:fs";
import { Pool } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  try { process.loadEnvFile(".env.local"); } catch { /* Report the missing configuration below. */ }
}
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is missing. Set it in .env.local.");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
try {
  const sql = readFileSync(new URL("../database/schema.sql", import.meta.url), "utf8");
  for (const statement of sql.split(";").map(s => s.trim()).filter(Boolean)) await pool.query(statement);
  const result = await pool.query("SELECT to_regclass('public.users') AS users, to_regclass('public.topics') AS topics, to_regclass('public.flashcards') AS flashcards");
  if (!result.rows[0]?.users || !result.rows[0]?.topics || !result.rows[0]?.flashcards) throw new Error("Schema verification failed.");
  console.log("Neon schema applied and verified.");
} finally { await pool.end(); }
