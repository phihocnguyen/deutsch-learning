import { DatabaseSync } from "node:sqlite";
import { mkdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const dataDirectory = new URL("../data/", import.meta.url);
mkdirSync(dataDirectory, { recursive: true });
const db = new DatabaseSync(fileURLToPath(new URL("deutsch-quest.sqlite", dataDirectory)));
try {
  db.exec("PRAGMA foreign_keys = ON");
  const version = db.prepare("PRAGMA user_version").get().user_version;
  if (version !== 0 && version !== 1) throw new Error("Unsupported database version. Use the matching migration before starting.");
  if (version === 0) {
    db.exec("BEGIN IMMEDIATE");
    try {
      db.exec(readFileSync(new URL("../database/schema.sql", import.meta.url), "utf8"));
      db.exec("PRAGMA user_version = 1; COMMIT");
    } catch (error) { db.exec("ROLLBACK"); throw error; }
  }
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Database foreign key check failed.");
  console.log(version === 0 ? "Created local database (schema v1)." : "Local database already initialized (schema v1); data preserved.");
} finally { db.close(); }
