const STORAGE_KEY = "sentence_history";
const MAX_ITEMS = 20;

function isValidEntry(entry) {
  return (
    entry !== null &&
    typeof entry === "object" &&
    typeof entry.id !== "undefined" &&
    typeof entry.sentence === "string" &&
    entry.result !== null &&
    typeof entry.result === "object" &&
    typeof entry.created_at === "string"
  );
}

export function getLocalHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidEntry);
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

export function deleteFromLocalHistory(id) {
  const existing = getLocalHistory();
  const updated = existing.filter((item) => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
}

export function clearLocalHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  return [];
}
