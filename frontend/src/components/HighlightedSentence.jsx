import { COLOR_MAP } from "./Legend";

export default function HighlightedSentence({ sentence, components }) {
  const segments = buildSegments(sentence, components);

  if (!segments) {
    // Fallback: plain text when positions are invalid
    return (
      <div style={styles.fallback}>
        <span>{sentence}</span>
        <p style={styles.fallbackNote}>（成分位置无效，展示原句）</p>
      </div>
    );
  }

  return (
    <p style={styles.sentence}>
      {segments.map((seg, i) =>
        seg.type ? (
          <mark
            key={i}
            title={COLOR_MAP[seg.type]?.label || seg.type}
            style={{
              background: COLOR_MAP[seg.type]?.bg || "#f3f4f6",
              borderRadius: 4,
              padding: "2px 5px",
              fontWeight: seg.type === "predicate" ? 600 : 400,
            }}
          >
            {seg.text}
          </mark>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </p>
  );
}

function buildSegments(sentence, components) {
  if (!sentence || !components || components.length === 0) {
    return [{ text: sentence, type: null }];
  }

  // Validate all positions
  for (const c of components) {
    if (
      typeof c.start !== "number" ||
      typeof c.end !== "number" ||
      c.start < 0 ||
      c.end > sentence.length ||
      c.start >= c.end
    ) {
      return null;
    }
  }

  // Sort by start position
  const sorted = [...components].sort((a, b) => a.start - b.start);

  // Check for overlaps
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].start < sorted[i - 1].end) {
      return null;
    }
  }

  const result = [];
  let cursor = 0;

  for (const c of sorted) {
    if (c.start > cursor) {
      result.push({ text: sentence.slice(cursor, c.start), type: null });
    }
    result.push({ text: sentence.slice(c.start, c.end), type: c.type });
    cursor = c.end;
  }

  if (cursor < sentence.length) {
    result.push({ text: sentence.slice(cursor), type: null });
  }

  return result;
}

const styles = {
  sentence: {
    fontSize: 18,
    lineHeight: 1.8,
    margin: 0,
    wordBreak: "break-word",
  },
  fallback: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  fallbackNote: {
    margin: 0,
    fontSize: 12,
    color: "#9ca3af",
  },
};
