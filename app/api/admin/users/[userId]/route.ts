import { adminSession, validAdminOrigin } from "@/lib/admin";
import { parseUserAction } from "@/lib/admin-policy";
import { AdminMutationError, mutateAdminUser } from "@/lib/admin-user-mutations";
import { neonPool } from "@/lib/neon";

type Context = { params: Promise<{ userId: string }> };
async function mutate(request: Request, context: Context, deleting: boolean) {
  if (!validAdminOrigin(request)) return Response.json({ error: "Yêu cầu không hợp lệ." }, { status: 403 });
  const session = await adminSession();
  if (!session) return Response.json({ error: "Bạn cần đăng nhập admin." }, { status: 403 });
  const { userId } = await context.params;
  if (!/^[1-9]\d{0,9}$/.test(userId) || Number(userId) > 2147483647) return Response.json({ error: "Người dùng không hợp lệ." }, { status: 400 });
  let action;
  try {
    action = parseUserAction(deleting ? { action: "delete" } : await request.json());
    if (!deleting && action.action === "delete") throw new Error("Phương thức không hợp lệ.");
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Thao tác không hợp lệ." }, { status: 400 }); }
  const client = await neonPool().connect();
  try {
    await mutateAdminUser(client, session.user.id, userId, action);
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return Response.json({ error: error instanceof AdminMutationError ? error.message : "Không cập nhật được tài khoản. Hãy thử lại." }, { status: error instanceof AdminMutationError ? error.status : 503 }); }
  finally { client.release(); }
}
export async function PATCH(request: Request, context: Context) { return mutate(request, context, false); }
export async function DELETE(request: Request, context: Context) { return mutate(request, context, true); }
