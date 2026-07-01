import { ANNOTATION_ROLES, ROLE_ALIASES, UNDERLINE_STYLES, BACKGROUND_STYLES } from "./types.js";
import { roleStyleMap } from "./roleStyleMap.js";

function normalizeRole(role) {
  return ROLE_ALIASES[role] || role;
}

function normalizeAnnotation(annotation, sentenceLength) {
  if (
    !annotation ||
    typeof annotation !== "object" ||
    typeof annotation.id !== "string" ||
    typeof annotation.start !== "number" ||
    typeof annotation.end !== "number" ||
    annotation.start < 0 ||
    annotation.end > sentenceLength ||
    annotation.start >= annotation.end
  ) {
    return null;
  }

  const role = normalizeRole(annotation.role);
  if (!ANNOTATION_ROLES.includes(role)) return null;

  const fontLevel = [1, 2, 3, 4].includes(annotation.fontLevel) ? annotation.fontLevel : 1;
  const underlineStyle = UNDERLINE_STYLES.includes(annotation.underlineStyle)
    ? annotation.underlineStyle
    : "none";
  const backgroundStyle = BACKGROUND_STYLES.includes(annotation.backgroundStyle)
    ? annotation.backgroundStyle
    : "none";

  return {
    relation: null,
    targetId: null,
    parentId: null,
    groupId: null,
    isContainer: false,
    ...annotation,
    role,
    fontLevel,
    underlineStyle,
    backgroundStyle,
    priority: annotation.priority ?? roleStyleMap[role]?.priority ?? 0,
  };
}

function pickPrimary(annotations) {
  if (!annotations.length) return null;

  return [...annotations].sort((a, b) => {
    const aContainer = a.isContainer || a.role === "clause" ? 1 : 0;
    const bContainer = b.isContainer || b.role === "clause" ? 1 : 0;
    if (aContainer !== bContainer) return aContainer - bContainer;
    if (b.priority !== a.priority) return b.priority - a.priority;

    const aLength = a.end - a.start;
    const bLength = b.end - b.start;
    if (aLength !== bLength) return aLength - bLength;

    return a.fontLevel - b.fontLevel;
  })[0];
}

export function buildAnnotationSegments(sentence, annotations) {
  if (!sentence) return [];

  const validAnnotations = (annotations || [])
    .map((annotation) => normalizeAnnotation(annotation, sentence.length))
    .filter(Boolean);

  const boundaries = new Set([0, sentence.length]);
  for (const annotation of validAnnotations) {
    boundaries.add(annotation.start);
    boundaries.add(annotation.end);
  }

  const points = [...boundaries].sort((a, b) => a - b);
  const segments = [];

  for (let i = 0; i < points.length - 1; i += 1) {
    const start = points[i];
    const end = points[i + 1];
    if (start === end) continue;

    const segmentAnnotations = validAnnotations.filter(
      (annotation) => annotation.start <= start && annotation.end >= end
    );
    const containerAnnotations = segmentAnnotations.filter(
      (annotation) => annotation.isContainer || annotation.role === "clause"
    );
    const inlineAnnotations = segmentAnnotations.filter(
      (annotation) => !annotation.isContainer && annotation.role !== "clause"
    );
    const primaryAnnotation = pickPrimary(segmentAnnotations);

    segments.push({
      text: sentence.slice(start, end),
      start,
      end,
      annotations: segmentAnnotations,
      containerAnnotations,
      inlineAnnotations,
      primaryAnnotation,
    });
  }

  return segments;
}
