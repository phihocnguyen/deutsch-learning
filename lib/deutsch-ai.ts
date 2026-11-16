const baseUrl = "https://vixoaidanloi.com/api/deutsch-ai";

export async function requestAI(endpoint: "generate" | "tts" | "score" | "qwen", body: object | FormData) {
  const token = process.env.AI_SERVICE_TOKEN?.trim();
  if (!token) throw new Error("Máy chủ chưa cấu hình AI_SERVICE_TOKEN.");
  const headers: Record<string, string> = {};
  if (!(body instanceof FormData)) headers["Content-Type"] = "application/json";
  headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${baseUrl}/${endpoint}`, {
    method: "POST", headers, body: body instanceof FormData ? body : JSON.stringify(body),
    cache: "no-store", signal: AbortSignal.timeout(endpoint === "qwen" ? 5000 : 60000),
  });
  if (!response.ok) throw new Error(response.status === 401 || response.status === 403
    ? "Dịch vụ AI từ chối AI_SERVICE_TOKEN. Hãy kiểm tra token trên máy chủ."
    : "Dịch vụ AI chưa sẵn sàng. Hãy thử lại.");
  return response;
}

export function aiError(error: unknown) {
  const missingToken = error instanceof Error && error.message === "Máy chủ chưa cấu hình AI_SERVICE_TOKEN.";
  return Response.json({ error: error instanceof Error && error.name === "Error" ? error.message : "Không kết nối được dịch vụ AI. Hãy thử lại." }, { status: missingToken ? 503 : 502 });
}
