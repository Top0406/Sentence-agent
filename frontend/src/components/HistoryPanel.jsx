import { useState } from "react";

function HistoryItem({ item, onSelect }) {
  const [hovered, setHovered] = useState(false);
  return (
    <li
      style={{ ...styles.item, background: hovered ? "#f3f4f6" : "transparent" }}
      onClick={() => onSelect(item)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={styles.sentence} title={item.sentence}>
        {item.sentence.length > 60
          ? item.sentence.slice(0, 60) + "…"
          : item.sentence}
      </span>
      <span style={styles.time}>{formatTime(item.created_at)}</span>
    </li>
  );
}

export default function HistoryPanel({ items, onSelect }) {
  if (!items || items.length === 0) {
    return (
      <div style={styles.card}>
        <p style={styles.emptyText}>暂无历史记录</p>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <h2 style={styles.heading}>最近分析</h2>
      <ul style={styles.list}>
        {items.map((item) => (
          <HistoryItem key={item.id} item={item} onSelect={onSelect} />
        ))}
      </ul>
    </div>
  );
}

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

const styles = {
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: "16px",
  },
  heading: {
    margin: "0 0 10px",
    fontSize: 14,
    fontWeight: 600,
    color: "#374151",
  },
  list: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  item: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 10px",
    borderRadius: 6,
    cursor: "pointer",
    gap: 12,
  },
  sentence: {
    fontSize: 13,
    color: "#111827",
    flex: 1,
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },
  time: {
    fontSize: 11,
    color: "#9ca3af",
    flexShrink: 0,
  },
  emptyText: {
    margin: 0,
    fontSize: 13,
    color: "#9ca3af",
    textAlign: "center",
    padding: "8px 0",
  },
};
