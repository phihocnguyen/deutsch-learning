export function isAdminEmail(email: string | null | undefined, configured = process.env.ADMIN_EMAILS ?? "") {
  if (!email?.trim()) return false;
  const emails = configured.split(",").map(value => value.trim().toLowerCase()).filter(Boolean);
  return emails.includes(email.trim().toLowerCase());
}

export type UserAction = { action: "rename"; name: string } | { action: "block" | "unblock" | "revoke-sessions" | "delete" };

export function parseUserAction(value: unknown): UserAction {
  if (!value || typeof value !== "object") throw new Error("Thao tác không hợp lệ.");
  const body = value as Record<string, unknown>;
  if (body.action === "rename") {
    if (typeof body.name !== "string" || !body.name.trim() || body.name.trim().length > 255) throw new Error("Tên cần từ 1 đến 255 ký tự.");
    return { action: "rename", name: body.name.trim().normalize("NFC") };
  }
  if (body.action === "block" || body.action === "unblock" || body.action === "revoke-sessions" || body.action === "delete") return { action: body.action };
  throw new Error("Thao tác không hợp lệ.");
}

export function canManageUser(actorId: string, target: { id: string | number; email: string | null }, action: UserAction["action"], configured?: string) {
  return action === "rename" || (String(target.id) !== actorId && !isAdminEmail(target.email, configured));
}

export type AdminUser = {
  id: string; name: string | null; email: string | null; disabled: boolean; isAdmin: boolean;
  topicCount: number; cardCount: number; sessionCount: number;
};
