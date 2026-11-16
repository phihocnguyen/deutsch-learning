import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";

const schema = readFileSync(new URL("../database/schema.sql", import.meta.url), "utf8");
function setup() {
  const db = new DatabaseSync(":memory:");
  db.exec(schema);
  db.prepare("INSERT INTO users (id, display_name) VALUES (?, ?)").run("learner-a", "Learner A");
  db.prepare("INSERT INTO users (id, display_name) VALUES (?, ?)").run("learner-b", "Learner B");
  db.prepare("INSERT INTO topics (id, owner_id, name, name_key) VALUES (?, ?, ?, ?)").run("travel", "learner-a", "Du lịch", "du lịch");
  db.prepare("INSERT INTO flashcards (id, owner_id, topic_id, german, vietnamese, article) VALUES (?, ?, ?, ?, ?, ?)").run("station", "learner-a", "travel", "Bahnhof", "Nhà ga", "der");
  return db;
}

test("schema stores topic/card/progress relations and safely re-applies without deleting data", () => {
  const db = setup();
  try {
    db.prepare("INSERT INTO flashcard_progress (owner_id, flashcard_id, status) VALUES (?, ?, ?)").run("learner-a", "station", "known");
    db.exec(schema);
    const row = db.prepare("SELECT t.name, f.german, p.status FROM topics t JOIN flashcards f ON f.topic_id = t.id JOIN flashcard_progress p ON p.flashcard_id = f.id").get();
    assert.deepEqual({ ...row }, { name: "Du lịch", german: "Bahnhof", status: "known" });
    assert.deepEqual(db.prepare("PRAGMA foreign_key_check").all(), []);
  } finally { db.close(); }
});

test("ownership and constraints reject orphan cards, cross-user writes and duplicate topics", () => {
  const db = setup();
  try {
    const card = db.prepare("INSERT INTO flashcards (id, owner_id, topic_id, german, vietnamese, article) VALUES (?, ?, ?, ?, ?, ?)");
    assert.throws(() => card.run("cross-user", "learner-b", "travel", "Zug", "Tàu", "der"));
    assert.throws(() => card.run("orphan", "learner-a", "missing", "Zug", "Tàu", "der"));
    assert.throws(() => card.run("bad-article", "learner-a", "travel", "Zug", "Tàu", "dem"));
    assert.throws(() => card.run("blank", "learner-a", "travel", " ", "Tàu", null));
    const progress = db.prepare("INSERT INTO flashcard_progress (owner_id, flashcard_id, status) VALUES (?, ?, ?)");
    assert.throws(() => progress.run("learner-b", "station", "known"));
    assert.throws(() => progress.run("learner-a", "station", "other"));
    const topic = db.prepare("INSERT INTO topics (id, owner_id, name, name_key) VALUES (?, ?, ?, ?)");
    assert.throws(() => topic.run("duplicate", "learner-a", "DU LỊCH", "du lịch"));
    topic.run("other-owner", "learner-b", "Du lịch", "du lịch");
    db.prepare("UPDATE users SET email = ? WHERE id = ?").run("test@example.com", "learner-a");
    assert.throws(() => db.prepare("UPDATE users SET email = ? WHERE id = ?").run("TEST@example.com", "learner-b"));
  } finally { db.close(); }
});

test("deleting a topic cascades to its cards and progress while keeping another user's data", () => {
  const db = setup();
  try {
    db.prepare("INSERT INTO flashcard_progress (owner_id, flashcard_id, status) VALUES (?, ?, ?)").run("learner-a", "station", "review");
    db.prepare("INSERT INTO topics (id, owner_id, name, name_key) VALUES (?, ?, ?, ?)").run("work", "learner-b", "Công việc", "công việc");
    db.prepare("DELETE FROM topics WHERE id = ?").run("travel");
    assert.equal(db.prepare("SELECT COUNT(*) AS count FROM flashcards").get().count, 0);
    assert.equal(db.prepare("SELECT COUNT(*) AS count FROM flashcard_progress").get().count, 0);
    assert.equal(db.prepare("SELECT name FROM topics WHERE id = ?").get("work").name, "Công việc");
  } finally { db.close(); }
});
