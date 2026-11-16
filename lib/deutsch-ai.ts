const baseUrl = "https://vixoaidanloi.com/api/deutsch-ai";

export async function requestAI(endpoint: "generate" | "tts" | "score" | "qwen", body: object | FormData) {
  const headers: Record<string, string> = {};
  if (!(body instanceof FormData)) headers["Content-Type"] = "application/json";
  if (process.env.DEUTSCH_AI_API_KEY) headers.Authorization = `Bearer ${process.env.DEUTSCH_AI_API_KEY}`;
  const response = await fetch(`${baseUrl}/${endpoint}`, {
    method: "POST", headers, body: body instanceof FormData ? body : JSON.stringify(body),
    cache: "no-store", signal: AbortSignal.timeout(endpoint === "qwen" ? 100000 : 60000),
  });
  if (!response.ok) throw new Error(response.status === 401 || response.status === 403
    ? "Dịch vụ AI yêu cầu xác thực. Hãy kiểm tra cấu hình máy chủ."
    : "Dịch vụ AI chưa sẵn sàng. Hãy thử lại.");
  return response;
}

export function aiError(error: unknown) {
  return Response.json({ error: error instanceof Error && error.name === "Error" ? error.message : "Không kết nối được dịch vụ AI. Hãy thử lại." }, { status: 502 });
}
