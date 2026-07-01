import { buildAnnotationSegments } from "../../annotation/buildAnnotationSegments.js";
import { getRoleStyle } from "../../annotation/roleStyleMap.js";
import { backgroundStyleMap, fontLevelMap, underlineStyleMap } from "../../annotation/visualStyleMap.js";

export default function AnnotatedSentence({
  sentence,
  annotations,
  selectedId,
  onSelectAnnotation,
}) {
  const segments = buildAnnotationSegments(sentence, annotations);

  return (
    <div style={styles.surface}>
      <p style={styles.sentence}>
        {segments.map((segment) => (
          <AnnotationSegment
            key={`${segment.start}-${segment.end}`}
            segment={segment}
            selectedId={selectedId}
            onSelectAnnotation={onSelectAnnotation}
          />
        ))}
      </p>
    </div>
  );
}

function AnnotationSegment({ segment, selectedId, onSelectAnnotation }) {
  const annotation = segment.primaryAnnotation;
  if (!annotation) {
    return <span>{segment.text}</span>;
  }

  const roleStyle = getRoleStyle(annotation.role);
  const fontLevelStyle = fontLevelMap[annotation.fontLevel] || fontLevelMap[1];
  const underline = underlineStyleMap[annotation.underlineStyle] || underlineStyleMap.none;
  const background = backgroundStyleMap[annotation.backgroundStyle] || backgroundStyleMap.none;
  const selectedAnnotation = segment.annotations.find((item) => item.id === selectedId);
  const isSelected = Boolean(selectedAnnotation);
  const showSelectedLabel = selectedAnnotation && segment.start === selectedAnnotation.start;
  const selectedRoleStyle = selectedAnnotation ? getRoleStyle(selectedAnnotation.role) : roleStyle;
  const extraCount = Math.max(0, segment.annotations.length - 1);

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={() => onSelectAnnotation(annotation.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelectAnnotation(annotation.id);
        }
      }}
      title={annotation.labelZh || roleStyle.label}
      style={{
        ...styles.segment,
        ...background.style,
        color: roleStyle.color,
        fontSize: fontLevelStyle.fontSize,
        fontWeight: fontLevelStyle.fontWeight,
        fontStyle: annotation.fontLevel >= 3 || annotation.role === "nonfinite" ? "italic" : "normal",
        opacity: fontLevelStyle.opacity,
        textDecorationLine: annotation.underlineStyle === "none" ? "none" : "underline",
        textDecorationColor: roleStyle.border,
        textDecorationThickness: annotation.underlineStyle === "doubleWavy" ? "2px" : "1.5px",
        textUnderlineOffset: "4px",
        backgroundColor: isSelected ? "rgba(254, 249, 195, 0.55)" : undefined,
        ...underline.style,
      }}
    >
      {segment.text}
      {showSelectedLabel && (
        <span
          style={{
            ...styles.label,
            color: selectedRoleStyle.color,
            borderColor: selectedRoleStyle.border,
          }}
        >
          {selectedRoleStyle.label}{extraCount > 0 ? ` +${extraCount}` : ""}
        </span>
      )}
    </span>
  );
}

const styles = {
  surface: {
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    background: "#fff",
    padding: "20px 18px",
  },
  sentence: {
    margin: 0,
    fontSize: 18,
    lineHeight: 2.1,
    color: "#111827",
    wordBreak: "break-word",
    whiteSpace: "pre-wrap",
  },
  segment: {
    display: "inline",
    borderRadius: 3,
    padding: "0 1px",
    margin: 0,
    cursor: "pointer",
    outline: "none",
    transition: "background-color 0.12s",
  },
  label: {
    display: "inline-block",
    verticalAlign: "super",
    fontSize: 9,
    lineHeight: 1.1,
    border: "1px solid",
    borderRadius: 999,
    padding: "0 3px",
    marginLeft: 2,
    background: "rgba(255,255,255,0.86)",
    fontStyle: "normal",
    fontWeight: 600,
  },
};
