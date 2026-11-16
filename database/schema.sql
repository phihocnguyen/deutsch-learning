-- PostgreSQL schema for Auth.js (Neon adapter) and user-owned learning data.
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  "emailVerified" TIMESTAMPTZ,
  image TEXT
);
ALTER TABLE users ADD COLUMN IF NOT EXISTS disabled BOOLEAN NOT NULL DEFAULT false;
CREATE TABLE IF NOT EXISTS admin_accounts (
  id SERIAL PRIMARY KEY,
  username VARCHAR(80) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash VARCHAR(64) PRIMARY KEY,
  admin_id INTEGER NOT NULL REFERENCES admin_accounts(id) ON DELETE CASCADE,
  expires TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS admin_sessions_expiry_index ON admin_sessions(expires);
CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  "providerAccountId" VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  id_token TEXT,
  scope TEXT,
  session_state TEXT,
  token_type TEXT,
  UNIQUE(provider, "providerAccountId")
);
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMPTZ NOT NULL,
  "sessionToken" VARCHAR(255) NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS verification_token (
  identifier TEXT NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  token TEXT NOT NULL,
  PRIMARY KEY(identifier, token)
);

CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(80) NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 80),
  name_key VARCHAR(160) NOT NULL CHECK (length(trim(name_key)) BETWEEN 1 AND 160),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(owner_id, name_key),
  UNIQUE(id, owner_id)
);
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id INTEGER NOT NULL,
  topic_id UUID NOT NULL,
  german VARCHAR(160) NOT NULL CHECK (length(trim(german)) BETWEEN 1 AND 160),
  vietnamese VARCHAR(300) NOT NULL CHECK (length(trim(vietnamese)) BETWEEN 1 AND 300),
  article VARCHAR(3) CHECK (article IS NULL OR article IN ('der','die','das')),
  plural VARCHAR(160) CHECK (plural IS NULL OR length(trim(plural)) BETWEEN 1 AND 160),
  example VARCHAR(1000) NOT NULL DEFAULT '',
  translation VARCHAR(1000) NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(id, owner_id),
  FOREIGN KEY(topic_id, owner_id) REFERENCES topics(id, owner_id) ON DELETE CASCADE
);
ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS ipa VARCHAR(300);
CREATE INDEX IF NOT EXISTS flashcards_topic_index ON flashcards(owner_id, topic_id, created_at, id);
CREATE TABLE IF NOT EXISTS flashcard_progress (
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  flashcard_id UUID NOT NULL,
  status VARCHAR(8) NOT NULL CHECK (status IN ('known','review')),
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY(owner_id, flashcard_id),
  FOREIGN KEY(flashcard_id, owner_id) REFERENCES flashcards(id, owner_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS flashcard_progress_status_index ON flashcard_progress(owner_id,status);
