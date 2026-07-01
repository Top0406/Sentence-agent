import { roleStyleMap } from "../../annotation/roleStyleMap.js";
import { backgroundStyleMap, fontLevelMap, underlineStyleMap } from "../../annotation/visualStyleMap.js";

const shownRoles = [
  "subject",
  "predicate",
  "linkingPredicate",
  "object",
  "directObject",
  "indirectObject",
  "complement",
  "attribute",
  "adverbial",
  "parenthesis",
  "appositive",
  "clause",
  "nonfinite",
  "parallel",
];

export default function AnnotationLegend() {
  return (
    <section style={styles.panel}>
      <h3 style={styles.title}>图例</h3>
      <LegendGroup title="角色颜色">
        {shownRoles.map((role) => (
          <span
            key={role}
            style={{
              ...styles.roleChip,
              background: roleStyleMap[role].bg,
              color: roleStyleMap[role].color,
              borderColor: roleStyleMap[role].border,
            }}
          >
            {roleStyleMap[role].label}
          </span>
        ))}
      </LegendGroup>

      <LegendGroup title="字体层级">
        {Object.entries(fontLevelMap).map(([level, item]) => (
          <span key={level} style={{ ...styles.sampleText, fontSize: item.fontSize, fontWeight: item.fontWeight }}>
            L{level} {item.label}
          </span>
        ))}
      </LegendGroup>

      <LegendGroup title="下划线线型">
        {Object.entries(underlineStyleMap).map(([name, item]) => (
          <span
            key={name}
            style={{
              ...styles.underlineSample,
              textDecorationLine: name === "none" ? "none" : "underline",
              ...item.style,
            }}
          >
            {item.label}
          </span>
        ))}
      </LegendGroup>

      <LegendGroup title="背景强调">
        {Object.entries(backgroundStyleMap).map(([name, item]) => (
          <span key={name} style={{ ...styles.backgroundSample, ...item.style }}>
            {item.label}
          </span>
        ))}
      </LegendGroup>
    </section>
  );
}

function LegendGroup({ title, children }) {
  return (
    <div style={styles.group}>
      <span style={styles.groupTitle}>{title}</span>
      <div style={styles.items}>{children}</div>
    </div>
  );
}

const styles = {
  panel: {
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    background: "#fff",
    padding: "16px",
  },
  title: {
    margin: "0 0 12px",
    fontSize: 15,
    fontWeight: 650,
    color: "#111827",
  },
  group: {
    display: "grid",
    gridTemplateColumns: "86px 1fr",
    gap: 10,
    alignItems: "start",
    marginTop: 10,
  },
  groupTitle: {
    fontSize: 12,
    color: "#6b7280",
    paddingTop: 3,
  },
  items: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
  },
  roleChip: {
    border: "1px solid",
    borderRadius: 999,
    padding: "2px 8px",
    fontSize: 12,
    fontWeight: 600,
  },
  sampleText: {
    color: "#374151",
    lineHeight: 1.4,
  },
  underlineSample: {
    color: "#374151",
    textUnderlineOffset: "4px",
    textDecorationColor: "#6b7280",
    fontSize: 12,
  },
  backgroundSample: {
    border: "1px solid #e5e7eb",
    borderRadius: 4,
    padding: "2px 6px",
    fontSize: 12,
    color: "#374151",
  },
};
