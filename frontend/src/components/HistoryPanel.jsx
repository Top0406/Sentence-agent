import { useState } from "react";

const COLLAPSED_LIMIT = 5;

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

export default function HistoryPanel({ items, onSelect, loading }) {
  const [expanded, setExpanded] = useState(false);

  if (loading) {
    return (
      <div style={styles.card}>
        <p style={styles.emptyText}>加载中…</p>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div style={styles.card}>
        <p style={styles.emptyText}>分析句子后，记录会出现在这里</p>
      </div>
    );
  }

  const hasMore = items.length > COLLAPSED_LIMIT;
  const visible = hasMore && !expanded ? items.slice(0, COLLAPSED_LIMIT) : items;
  const hiddenCount = items.length - COLLAPSED_LIMIT;

  return (
    <div style={styles.card}>
      <h2 style={styles.heading}>最近分析</h2>
      <ul style={styles.list}>
        {visible.map((item) => (
          <HistoryItem key={item.id} item={item} onSelect={onSelect} />
        ))}
      </ul>
      {hasMore && (
        <button style={styles.toggleBtn} onClick={() => setExpanded((v) => !v)}>
          {expanded ? "收起" : `查看更多（+${hiddenCount} 条）`}
        </button>
      )}
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
  toggleBtn: {
    marginTop: 8,
    padding: "4px 0",
    background: "none",
    border: "none",
    color: "#6b7280",
    fontSize: 12,
    cursor: "pointer",
    width: "100%",
    textAlign: "center",
  },
};
