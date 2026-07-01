import { getRoleStyle } from "../../annotation/roleStyleMap.js";
import {
  backgroundStyleMap,
  fontLevelMap,
  relationLabelMap,
  underlineStyleMap,
} from "../../annotation/visualStyleMap.js";

export default function AnnotationDetailPanel({ annotation, annotations, sentence }) {
  if (!annotation) {
    return (
      <section style={styles.panel}>
        <h3 style={styles.title}>标注解释</h3>
        <p style={styles.empty}>点击原句中的标注，查看语法角色、关系和说明。</p>
      </section>
    );
  }

  const roleStyle = getRoleStyle(annotation.role);
  const target = annotations.find((item) => item.id === annotation.targetId);
  const parent = annotations.find((item) => item.id === annotation.parentId);
  const text = sentence.slice(annotation.start, annotation.end);

  return (
    <section style={styles.panel}>
      <div style={styles.header}>
        <h3 style={styles.title}>{annotation.labelZh || roleStyle.label}</h3>
        <span style={{ ...styles.badge, background: roleStyle.bg, color: roleStyle.color }}>
          {roleStyle.label}
        </span>
      </div>

      <p style={styles.quoted}>{text}</p>
      <dl style={styles.metaGrid}>
        <Meta label="层级" value={fontLevelMap[annotation.fontLevel]?.label || `Level ${annotation.fontLevel}`} />
        <Meta label="线型" value={underlineStyleMap[annotation.underlineStyle]?.label || annotation.underlineStyle} />
        <Meta label="背景" value={backgroundStyleMap[annotation.backgroundStyle]?.label || annotation.backgroundStyle} />
        <Meta label="关系" value={relationLabelMap[annotation.relation] || annotation.relation || "无"} />
        <Meta label="目标" value={target ? `${target.labelZh || target.id}：${sentence.slice(target.start, target.end)}` : "无"} />
        <Meta label="父级" value={parent ? `${parent.labelZh || parent.id}` : "无"} />
        <Meta label="组" value={annotation.groupId || "无"} />
        <Meta label="容器" value={annotation.isContainer ? "是" : "否"} />
      </dl>
      {annotation.explanationZh && <p style={styles.explanation}>{annotation.explanationZh}</p>}
    </section>
  );
}

function Meta({ label, value }) {
  return (
    <div style={styles.metaItem}>
      <dt style={styles.metaLabel}>{label}</dt>
      <dd style={styles.metaValue}>{value}</dd>
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
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  title: {
    margin: 0,
    fontSize: 15,
    fontWeight: 650,
    color: "#111827",
  },
  badge: {
    borderRadius: 999,
    padding: "3px 8px",
    fontSize: 12,
    fontWeight: 600,
    flexShrink: 0,
  },
  empty: {
    margin: "10px 0 0",
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 1.6,
  },
  quoted: {
    margin: "12px 0",
    padding: "8px 10px",
    borderLeft: "3px solid #d1d5db",
    background: "#f9fafb",
    color: "#1f2937",
    fontSize: 14,
  },
  metaGrid: {
    margin: 0,
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 8,
  },
  metaItem: {
    minWidth: 0,
  },
  metaLabel: {
    fontSize: 11,
    color: "#9ca3af",
  },
  metaValue: {
    margin: "2px 0 0",
    fontSize: 12,
    color: "#374151",
    wordBreak: "break-word",
  },
  explanation: {
    margin: "12px 0 0",
    fontSize: 13,
    lineHeight: 1.65,
    color: "#374151",
  },
};
