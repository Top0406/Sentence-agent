export const COLOR_MAP = {
  subject: { bg: "#dbeafe", label: "主语" },
  predicate: { bg: "#dcfce7", label: "谓语" },
  object: { bg: "#fed7aa", label: "宾语" },
  complement: { bg: "#e9d5ff", label: "补语/表语" },
  modifier: { bg: "#e5e7eb", label: "修饰成分" },
  clause: { bg: "#fef08a", label: "从句" },
};

export default function Legend() {
  return (
    <div style={styles.container}>
      <span style={styles.title}>图例：</span>
      {Object.entries(COLOR_MAP).map(([type, { bg, label }]) => (
        <span key={type} style={{ ...styles.chip, background: bg }}>
          {label}
        </span>
      ))}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    alignItems: "center",
    fontSize: 13,
    color: "#374151",
  },
  title: {
    color: "#6b7280",
    marginRight: 2,
  },
  chip: {
    padding: "2px 10px",
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 500,
    border: "1px solid rgba(0,0,0,0.08)",
  },
};
