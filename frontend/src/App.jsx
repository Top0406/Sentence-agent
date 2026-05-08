import { useState, useRef } from "react";
import SentenceInput from "./components/SentenceInput";
import AnalysisResult from "./components/AnalysisResult";
import HistoryPanel from "./components/HistoryPanel";
import { analyzeSentence } from "./api/client";
import { getLocalHistory, saveToLocalHistory } from "./api/localHistory";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState(() => getLocalHistory());
  const inputRef = useRef(null);

  async function handleAnalyze(sentence) {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await analyzeSentence(sentence);
      if (!data.original_sentence || !Array.isArray(data.components)) {
        setError("响应格式异常，请稍后重试");
        return;
      }
      setResult(data);
      setHistory(saveToLocalHistory(sentence, data));
    } catch(err) {
      setError(err.message || "分析服务暂时不可用，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  function handleHistorySelect(item) {
    setResult(item.result);
    setError("");
    if (inputRef.current) {
      inputRef.current.setValue(item.sentence);
    }
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>英语句子结构图解器</h1>
        <p style={styles.subtitle}>输入英文句子，自动高亮展示句子成分</p>
      </header>

      <main style={styles.main}>
        <div style={styles.inputCard}>
          <SentenceInput onAnalyze={handleAnalyze} loading={loading} ref={inputRef} />
        </div>

        {error && (
          <div style={styles.errorBox}>
            <p style={styles.errorText}>{error}</p>
          </div>
        )}

        <HistoryPanel items={history} onSelect={handleHistorySelect} />

        {result && <AnalysisResult result={result} />}
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f9fafb",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  header: {
    background: "#fff",
    borderBottom: "1px solid #e5e7eb",
    padding: "20px 24px",
  },
  title: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
    color: "#111827",
  },
  subtitle: {
    margin: "4px 0 0",
    fontSize: 14,
    color: "#6b7280",
  },
  main: {
    maxWidth: 760,
    margin: "0 auto",
    padding: "24px 16px 48px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  inputCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: "16px",
  },
  errorBox: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: 6,
    padding: "10px 14px",
  },
  errorText: {
    margin: 0,
    color: "#dc2626",
    fontSize: 14,
  },
};
