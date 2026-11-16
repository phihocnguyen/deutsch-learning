-- Initial SQLite schema for personal topics, flashcards and learning progress.
-- Enable foreign keys on EVERY connection, including future API connections.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(id) BETWEEN 1 AND 100),
  auth_subject TEXT UNIQUE CHECK (auth_subject IS NULL OR length(trim(auth_subject)) > 0),
  display_name TEXT NOT NULL CHECK (length(trim(display_name)) BETWEEN 1 AND 100),
  email TEXT CHECK (email IS NULL OR length(trim(email)) BETWEEN 1 AND 254),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users(lower(trim(email))) WHERE email IS NOT NULL;

CREATE TABLE IF NOT EXISTS topics (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(id) BETWEEN 1 AND 100),
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 80),
  -- The API must derive name_key = name.trim().normalize('NFC').toLocaleLowerCase('vi').
  -- SQLite lower() alone does not handle Vietnamese case folding.
  name_key TEXT NOT NULL CHECK (length(trim(name_key)) BETWEEN 1 AND 80),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (owner_id, name_key),
  UNIQUE (id, owner_id)
);

CREATE TABLE IF NOT EXISTS flashcards (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(id) BETWEEN 1 AND 100),
  owner_id TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  german TEXT NOT NULL CHECK (length(trim(german)) BETWEEN 1 AND 160),
  vietnamese TEXT NOT NULL CHECK (length(trim(vietnamese)) BETWEEN 1 AND 300),
  article TEXT CHECK (article IS NULL OR article IN ('der', 'die', 'das')),
  plural TEXT CHECK (plural IS NULL OR length(trim(plural)) BETWEEN 1 AND 160),
  example TEXT NOT NULL DEFAULT '' CHECK (length(example) <= 1000),
  translation TEXT NOT NULL DEFAULT '' CHECK (length(translation) <= 1000),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (id, owner_id),
  FOREIGN KEY (topic_id, owner_id) REFERENCES topics(id, owner_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS flashcards_topic_index ON flashcards(owner_id, topic_id, created_at, id);

CREATE TABLE IF NOT EXISTS flashcard_progress (
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  flashcard_id TEXT NOT NULL,
  -- No row means "new", matching the current browser progress model.
  status TEXT NOT NULL CHECK (status IN ('known', 'review')),
  last_reviewed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  PRIMARY KEY (owner_id, flashcard_id),
  FOREIGN KEY (flashcard_id, owner_id) REFERENCES flashcards(id, owner_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS flashcard_progress_status_index ON flashcard_progress(owner_id, status);
