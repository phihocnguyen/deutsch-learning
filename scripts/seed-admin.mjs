import { Pool } from "@neondatabase/serverless";
import { hashAdminPassword, verifyAdminPassword } from "../lib/admin-password.ts";

try { process.loadEnvFile(".env.local"); } catch { /* Environment variables may already be configured. */ }
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is missing.");
const username = (process.env.ADMIN_SEED_USERNAME || "admin").trim().toLowerCase();
const password = process.env.ADMIN_SEED_PASSWORD;
if (!/^[a-z0-9_-]{3,80}$/.test(username) || !password || password.length < 12 || password.length > 1024) throw new Error("Set ADMIN_SEED_USERNAME and ADMIN_SEED_PASSWORD (12–1024 characters).");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
try {
  const encoded = await hashAdminPassword(password);
  const result = await pool.query("INSERT INTO admin_accounts(username,password_hash) VALUES($1,$2) ON CONFLICT(username) DO NOTHING RETURNING id", [username, encoded]);
  if (result.rowCount) console.log("Admin account created with a scrypt password hash.");
  const existing = await pool.query("SELECT password_hash FROM admin_accounts WHERE username=$1", [username]);
  if (!existing.rows[0] || !await verifyAdminPassword(password, existing.rows[0].password_hash)) throw new Error("An existing admin has a different password; it has not been overwritten.");
  console.log("Admin credentials verified successfully.");
} finally { await pool.end(); }
