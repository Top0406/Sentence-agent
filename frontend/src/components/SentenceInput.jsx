import { useState, forwardRef, useImperativeHandle } from "react";

const MAX_LENGTH = 500;

const SentenceInput = forwardRef(function SentenceInput({ onAnalyze, loading }, ref) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);

  useImperativeHandle(ref, () => ({
    setValue(sentence) {
      setText(sentence);
      setError("");
    },
  }));

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
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="请输入英文句子，例如：The boy who won the prize is my brother."
        style={{ ...styles.textarea, borderColor: focused ? "#2563eb" : "#d1d5db" }}
        disabled={loading}
        rows={3}
        maxLength={520}
      />
      <div style={styles.row}>
        <span style={{
          ...styles.counter,
          color: text.length > 490 ? "#dc2626" : text.length > 450 ? "#d97706" : "#9ca3af",
        }}>
          {text.length} / {MAX_LENGTH}
        </span>
        <button
          type="submit"
          disabled={loading}
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
          style={{
            ...styles.button,
            background: loading ? "#2563eb" : btnHovered ? "#1d4ed8" : "#2563eb",
            opacity: loading ? 0.6 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "分析中…" : "分析"}
        </button>
      </div>
      {error && <p style={styles.error}>{error}</p>}
    </form>
  );
});

export default SentenceInput;

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
    transition: "border-color 0.15s",
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
    fontWeight: 500,
    transition: "background 0.15s, opacity 0.15s",
  },
  error: {
    margin: 0,
    color: "#dc2626",
    fontSize: 13,
  },
};
