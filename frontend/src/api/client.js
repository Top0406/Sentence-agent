const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function analyzeSentence(sentence) {
  const res = await fetch(`${BASE_URL}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sentence }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "分析服务暂时不可用，请稍后重试");
  }

  return data;
}

export async function fetchHistory(limit = 20) {
  const res = await fetch(`${BASE_URL}/api/history?limit=${limit}`);
  if (!res.ok) return [];
  return res.json();
}
