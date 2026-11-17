import test from "node:test";
import assert from "node:assert/strict";
import { ownerStorageKey } from "../lib/owner-storage.ts";

test("learning data uses a separate local key for each account", () => {
  assert.equal(ownerStorageKey("deutsch-quest-progress-v1", "12"), "deutsch-quest-progress-v1:owner:12");
  assert.notEqual(ownerStorageKey("deutsch-quest-progress-v1", "12"), ownerStorageKey("deutsch-quest-progress-v1", "13"));
  assert.notEqual(ownerStorageKey("deutsch-quest-progress-v1", "12"), ownerStorageKey("deutsch-quest-grammar-v1", "12"));
  assert.throws(() => ownerStorageKey("deutsch-quest-progress-v1", ""));
});
