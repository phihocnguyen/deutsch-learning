export type FeedbackCategory = "feedback" | "bug";
export type FeedbackInput = { category: FeedbackCategory; message: string; pagePath: string };

export function parseFeedbackInput(value: unknown): FeedbackInput | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  if (input.category !== "feedback" && input.category !== "bug") return null;
  if (typeof input.message !== "string" || typeof input.pagePath !== "string") return null;
  const message = input.message.trim().normalize("NFC");
  if (message.length < 10 || message.length > 2000) return null;
  if (!input.pagePath.startsWith("/") || /^\/[\\/]/.test(input.pagePath) || input.pagePath.length > 300 || /[\r\n]/.test(input.pagePath)) return null;
  return { category: input.category, message, pagePath: input.pagePath };
}
