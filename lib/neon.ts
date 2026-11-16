import { Pool } from "@neondatabase/serverless";

const globalPool = globalThis as typeof globalThis & { deutschLearningPool?: Pool };
export function neonPool() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured.");
  globalPool.deutschLearningPool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
  return globalPool.deutschLearningPool;
}
