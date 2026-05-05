import HighlightedSentence from "./HighlightedSentence";
import Legend from "./Legend";
import { COLOR_MAP } from "./Legend";

export default function AnalysisResult({ result }) {
  const {
    original_sentence,
    translation_zh,
    main_structure,
    components,
    clauses,
    explanation_zh,
    warnings,
  } = result;

  return (
    <div style={styles.container}>
      {/* Highlighted sentence */}
      <section style={styles.card}>
        <h3 style={styles.sectionTitle}>句子高亮</h3>
        <HighlightedSentence sentence={original_sentence} components={components} />
        <div style={{ marginTop: 10 }}>
          <Legend />
        </div>
      </section>

      {/* Main structure */}
      <section style={styles.card}>
        <h3 style={styles.sectionTitle}>主句结构</h3>
        <div style={styles.structureGrid}>
          {main_structure.subject && (
            <StructureItem label="主语 S" text={main_structure.subject} type="subject" />
          )}
          {main_structure.predicate && (
            <StructureItem label="谓语 V" text={main_structure.predicate} type="predicate" />
          )}
          {main_structure.object_or_complement && (
            <StructureItem
              label="宾/表语 O/C"
              text={main_structure.object_or_complement}
              type="complement"
            />
          )}
        </div>
      </section>

      {/* Components list */}
      <section style={styles.card}>
        <h3 style={styles.sectionTitle}>成分列表</h3>
        <ul style={styles.list}>
          {components.map((c, i) => (
            <li key={i} style={styles.listItem}>
              <span
                style={{
                  ...styles.typeBadge,
                  background: COLOR_MAP[c.type]?.bg || "#f3f4f6",
                }}
              >
                {COLOR_MAP[c.type]?.label || c.type}
              </span>
              <span style={styles.componentText}>{c.text}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Clauses */}
      {clauses && clauses.length > 0 && (
        <section style={styles.card}>
          <h3 style={styles.sectionTitle}>从句列表</h3>
          <ul style={styles.list}>
            {clauses.map((cl, i) => (
              <li key={i} style={styles.listItem}>
                <span style={{ ...styles.typeBadge, background: "#fef08a" }}>
                  {cl.function_zh}
                </span>
                <span style={styles.componentText}>
                  {cl.text}
                  {cl.modifies && (
                    <span style={styles.modifies}>（修饰 {cl.modifies}）</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Chinese explanation */}
      <section style={styles.card}>
        <h3 style={styles.sectionTitle}>中文解释</h3>
        {translation_zh && <p style={styles.translation}>译文：{translation_zh}</p>}
        <p style={styles.explanation}>{explanation_zh}</p>
      </section>

      {/* Warnings */}
      {warnings && warnings.length > 0 && (
        <div style={styles.warnings}>
          {warnings.map((w, i) => (
            <p key={i} style={styles.warningItem}>
              ⚠ {w}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function StructureItem({ label, text, type }) {
  return (
    <div style={styles.structureItem}>
      <span style={styles.structureLabel}>{label}</span>
      <span
        style={{
          ...styles.structureValue,
          background: COLOR_MAP[type]?.bg || "#f3f4f6",
        }}
      >
        {text}
      </span>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: "14px 16px",
  },
  sectionTitle: {
    margin: "0 0 10px 0",
    fontSize: 13,
    fontWeight: 600,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  structureGrid: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  structureItem: {
    display: "flex",
    alignItems: "baseline",
    gap: 8,
  },
  structureLabel: {
    fontSize: 12,
    color: "#9ca3af",
    width: 72,
    flexShrink: 0,
  },
  structureValue: {
    padding: "2px 8px",
    borderRadius: 4,
    fontSize: 14,
    fontWeight: 500,
  },
  list: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  typeBadge: {
    padding: "2px 8px",
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 500,
    border: "1px solid rgba(0,0,0,0.08)",
    flexShrink: 0,
  },
  componentText: {
    fontSize: 14,
    color: "#1f2937",
  },
  modifies: {
    marginLeft: 4,
    fontSize: 12,
    color: "#9ca3af",
  },
  translation: {
    margin: "0 0 6px 0",
    fontSize: 14,
    color: "#374151",
  },
  explanation: {
    margin: 0,
    fontSize: 14,
    color: "#374151",
    lineHeight: 1.6,
  },
  warnings: {
    padding: "10px 14px",
    background: "#fffbeb",
    border: "1px solid #fde68a",
    borderRadius: 6,
  },
  warningItem: {
    margin: 0,
    fontSize: 12,
    color: "#92400e",
    lineHeight: 1.5,
  },
};
