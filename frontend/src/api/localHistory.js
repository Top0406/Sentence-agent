const STORAGE_KEY = "sentence_history";
const MAX_ITEMS = 20;

export function getLocalHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveToLocalHistory(sentence, result) {
  const existing = getLocalHistory();
  const entry = {
    id: Date.now(),
    sentence,
    result,
    created_at: new Date().toISOString(),
  };
  const updated = [entry, ...existing].slice(0, MAX_ITEMS);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // storage quota exceeded — silently ignore
  }
  return updated;
}
