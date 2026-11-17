const baseUrl = "https://vixoaidanloi.com/api/deutsch-ai";

export async function requestAI(endpoint: "generate" | "tts" | "score" | "qwen", body: object | FormData) {
  const token = process.env.AI_SERVICE_TOKEN?.trim();
  if (!token) throw new Error("Dịch vụ chưa được cấu hình.");
  const headers: Record<string, string> = {};
  if (!(body instanceof FormData)) headers["Content-Type"] = "application/json";
  headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${baseUrl}/${endpoint}`, {
    method: "POST", headers, body: body instanceof FormData ? body : JSON.stringify(body),
    cache: "no-store", signal: AbortSignal.timeout(endpoint === "qwen" ? 5000 : 60000),
  });
  if (!response.ok) throw new Error(response.status === 401 || response.status === 403
    ? "Dịch vụ hiện chưa xác thực được. Hãy thử lại sau."
    : "Dịch vụ hiện chưa sẵn sàng. Hãy thử lại sau.");
  return response;
}

export function aiError(error: unknown) {
  const unavailable = error instanceof Error && error.message === "Dịch vụ chưa được cấu hình.";
  return Response.json({ error: "Chức năng này đang tạm gián đoạn. Hãy thử lại sau." }, { status: unavailable ? 503 : 502 });
}
