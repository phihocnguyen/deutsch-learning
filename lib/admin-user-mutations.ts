import { canManageUser, type UserAction } from "./admin-policy.ts";

type Client = { query: (sql: string, values?: unknown[]) => Promise<{ rows: Record<string, unknown>[]; rowCount: number | null }> };
export class AdminMutationError extends Error {
  status: number;
  constructor(message: string, status: number) { super(message); this.status = status; }
}

export async function mutateAdminUser(client: Client, actorId: string, targetId: string, action: UserAction, configured?: string) {
  await client.query("BEGIN");
  try {
    const result = await client.query("SELECT id,email FROM users WHERE id=$1 FOR UPDATE", [Number(targetId)]);
    const target = result.rows[0] as { id: number; email: string | null } | undefined;
    if (!target) throw new AdminMutationError("Không tìm thấy người dùng.", 404);
    if (!canManageUser(actorId, target, action.action, configured)) throw new AdminMutationError("Không thể khóa, xóa hoặc thu hồi phiên của tài khoản admin hay chính bạn.", 403);
    if (action.action === "rename") await client.query("UPDATE users SET name=$2 WHERE id=$1", [Number(targetId), action.name]);
    if (action.action === "block" || action.action === "unblock") await client.query("UPDATE users SET disabled=$2 WHERE id=$1", [Number(targetId), action.action === "block"]);
    if (["block", "revoke-sessions", "delete"].includes(action.action)) await client.query('DELETE FROM sessions WHERE "userId"=$1', [Number(targetId)]);
    if (action.action === "delete") {
      await client.query('DELETE FROM accounts WHERE "userId"=$1', [Number(targetId)]);
      await client.query("DELETE FROM users WHERE id=$1", [Number(targetId)]);
    }
    await client.query("COMMIT");
  } catch (error) { await client.query("ROLLBACK"); throw error; }
}
