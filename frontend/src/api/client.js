const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function analyzeSentence(sentence) {
  const res = await fetch(`${BASE_URL}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sentence }),
  });

  const text = await res.text();
  const data = parseJson(text);

  if (!res.ok) {
    const msg =
      data?.error || data?.detail || data?.message ||
      "分析服务暂时不可用，请稍后重试";
    throw new Error(msg);
  }

  if (!data) {
    throw new Error("服务器返回格式异常，请稍后重试");
  }

  return data;
}

export async function fetchHistory(limit = 20) {
  const res = await fetch(`${BASE_URL}/api/history?limit=${limit}`);
  if (!res.ok) return [];
  const text = await res.text();
  return parseJson(text) ?? [];
}
