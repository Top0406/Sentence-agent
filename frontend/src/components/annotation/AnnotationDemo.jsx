import { useMemo, useState } from "react";
import { demoAnnotations, demoSentence } from "../../annotation/demoData.js";
import AnnotatedSentence from "./AnnotatedSentence.jsx";
import AnnotationDetailPanel from "./AnnotationDetailPanel.jsx";
import AnnotationLegend from "./AnnotationLegend.jsx";

export default function AnnotationDemo() {
  const [selectedId, setSelectedId] = useState("relative-clause");
  const selectedAnnotation = useMemo(
    () => demoAnnotations.find((annotation) => annotation.id === selectedId) || null,
    [selectedId]
  );

  return (
    <section style={styles.card}>
      <div style={styles.heading}>
        <div>
          <h2 style={styles.title}>原句内嵌语法标注图解层</h2>
          <p style={styles.subtitle}>Phase 4.1 静态演示：人工 ranges 驱动，不调用 parser/API。</p>
        </div>
        <span style={styles.prototypeBadge}>Phase 4.1</span>
      </div>

      <AnnotatedSentence
        sentence={demoSentence}
        annotations={demoAnnotations}
        selectedId={selectedId}
        onSelectAnnotation={setSelectedId}
      />

      <div style={styles.grid}>
        <AnnotationDetailPanel
          annotation={selectedAnnotation}
          annotations={demoAnnotations}
          sentence={demoSentence}
        />
        <AnnotationLegend />
      </div>
    </section>
  );
}

const styles = {
  card: {
    border: "1px solid #d1d5db",
    borderRadius: 8,
    background: "#f8fafc",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  heading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  title: {
    margin: 0,
    fontSize: 17,
    fontWeight: 700,
    color: "#111827",
  },
  subtitle: {
    margin: "4px 0 0",
    fontSize: 13,
    color: "#6b7280",
  },
  prototypeBadge: {
    border: "1px solid #cbd5e1",
    borderRadius: 999,
    padding: "3px 8px",
    fontSize: 11,
    color: "#475569",
    background: "#fff",
    flexShrink: 0,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 14,
  },
};
