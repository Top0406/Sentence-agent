import { useState } from "react";

const MAX_LENGTH = 500;

export default function SentenceInput({ onAnalyze, loading }) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) {
      setError("请输入英文句子");
      return;
    }
    if (text.length > MAX_LENGTH) {
      setError("句子过长，请缩短后重试");
      return;
    }
    setError("");
    onAnalyze(text.trim());
  }

  function handleChange(e) {
    setText(e.target.value);
    if (error) setError("");
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <textarea
        value={text}
        onChange={handleChange}
        placeholder="请输入英文句子，例如：The boy who won the prize is my brother."
        style={styles.textarea}
        disabled={loading}
        rows={3}
        maxLength={520}
      />
      <div style={styles.row}>
        <span style={styles.counter}>
          {text.length} / {MAX_LENGTH}
        </span>
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "分析中…" : "分析"}
        </button>
      </div>
      {error && <p style={styles.error}>{error}</p>}
    </form>
  );
}

const styles = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  textarea: {
    width: "100%",
    padding: "10px 12px",
    fontSize: 15,
    border: "1px solid #d1d5db",
    borderRadius: 6,
    resize: "vertical",
    fontFamily: "inherit",
    lineHeight: 1.5,
    boxSizing: "border-box",
    outline: "none",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  counter: {
    fontSize: 12,
    color: "#9ca3af",
  },
  button: {
    padding: "8px 24px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontSize: 15,
    cursor: "pointer",
    fontWeight: 500,
  },
  error: {
    margin: 0,
    color: "#dc2626",
    fontSize: 13,
  },
};
