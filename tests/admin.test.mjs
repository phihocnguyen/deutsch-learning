import test from "node:test";
import assert from "node:assert/strict";
import { hashAdminPassword, verifyAdminPassword, adminTokenHash } from "../lib/admin-password.ts";
import { isAdminEmail, canManageUser, parseUserAction } from "../lib/admin-policy.ts";
import { mutateAdminUser, AdminMutationError } from "../lib/admin-user-mutations.ts";

test("admin passwords use salted hashes and reject incorrect passwords", async () => {
  const first = await hashAdminPassword("a-test-password-123");
  const second = await hashAdminPassword("a-test-password-123");
  assert.notEqual(first, second);
  assert.ok(!first.includes("a-test-password-123"));
  assert.equal(await verifyAdminPassword("a-test-password-123", first), true);
  assert.equal(await verifyAdminPassword("wrong-password", first), false);
  assert.equal(await verifyAdminPassword("a-test-password-123", "broken"), false);
  assert.match(adminTokenHash("test-token"), /^[a-f0-9]{64}$/);
});

test("admin allowlist requires an exact email and protects admins and self", () => {
  assert.equal(isAdminEmail("Owner@Example.com", " owner@example.com, second@example.com "), true);
  assert.equal(isAdminEmail("attacker-owner@example.com", "owner@example.com"), false);
  assert.equal(isAdminEmail("owner@example.com", ""), false);
  assert.equal(canManageUser("1", { id: 1, email: null }, "delete", ""), false);
  assert.equal(canManageUser("admin:1", { id: 3, email: "owner@example.com" }, "block", "owner@example.com"), false);
  assert.equal(canManageUser("admin:1", { id: 3, email: "learner@example.com" }, "block", "owner@example.com"), true);
  assert.equal(canManageUser("1", { id: 1, email: null }, "rename", ""), true);
});

test("admin actions only accept supported operations and bounded names", () => {
  assert.deepEqual(parseUserAction({ action: "rename", name: "  Learner  " }), { action: "rename", name: "Learner" });
  for (const value of [null, {}, { action: "promote" }, { action: "rename", name: " " }, { action: "rename", name: "x".repeat(256) }]) assert.throws(() => parseUserAction(value));
});

function fakeClient(target, failOn = "") {
  const calls = [];
  return { calls, async query(sql, values) {
    calls.push({ sql, values });
    if (sql === failOn) throw new Error("Simulated database failure");
    return { rows: sql.startsWith("SELECT") && target ? [target] : [], rowCount: target ? 1 : 0 };
  } };
}

test("blocking a user changes status and revokes sessions within one transaction", async () => {
  const client = fakeClient({ id: 2, email: "learner@example.com" });
  await mutateAdminUser(client, "admin:1", "2", { action: "block" }, "");
  assert.equal(client.calls[0].sql, "BEGIN");
  assert.match(client.calls[1].sql, /FOR UPDATE/);
  assert.deepEqual(client.calls[2].values, [2, true]);
  assert.match(client.calls[3].sql, /DELETE FROM sessions/);
  assert.equal(client.calls.at(-1).sql, "COMMIT");
});

test("deleting a user removes Auth.js dependants before the user; failures roll back", async () => {
  const client = fakeClient({ id: 2, email: null });
  await mutateAdminUser(client, "admin:1", "2", { action: "delete" }, "");
  assert.deepEqual(client.calls.slice(2, -1).map(call => call.sql), ['DELETE FROM sessions WHERE "userId"=$1', 'DELETE FROM accounts WHERE "userId"=$1', "DELETE FROM users WHERE id=$1"]);
  const failing = fakeClient({ id: 2, email: null }, 'DELETE FROM accounts WHERE "userId"=$1');
  await assert.rejects(mutateAdminUser(failing, "admin:1", "2", { action: "delete" }, ""));
  assert.equal(failing.calls.at(-1).sql, "ROLLBACK");
  assert.ok(!failing.calls.some(call => call.sql === "COMMIT"));
});

test("missing and protected users cannot be mutated", async () => {
  const missing = fakeClient(null);
  await assert.rejects(mutateAdminUser(missing, "admin:1", "2", { action: "delete" }, ""), error => error instanceof AdminMutationError && error.status === 404);
  const protectedUser = fakeClient({ id: 2, email: "owner@example.com" });
  await assert.rejects(mutateAdminUser(protectedUser, "admin:1", "2", { action: "block" }, "owner@example.com"), error => error instanceof AdminMutationError && error.status === 403);
  assert.equal(protectedUser.calls.at(-1).sql, "ROLLBACK");
  assert.ok(!protectedUser.calls.some(call => call.sql.startsWith("UPDATE")));
});
