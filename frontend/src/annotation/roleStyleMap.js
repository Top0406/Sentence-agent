export const roleStyleMap = {
  subject: {
    label: "主语",
    bg: "#fee2e2",
    color: "#dc2626",
    border: "#fca5a5",
    priority: 90,
  },
  predicate: {
    label: "谓语",
    bg: "#dbeafe",
    color: "#2563eb",
    border: "#60a5fa",
    priority: 100,
  },
  linkingPredicate: {
    label: "系表结构",
    bg: "#e0f2fe",
    color: "#38bdf8",
    border: "#7dd3fc",
    priority: 98,
  },
  object: {
    label: "宾语",
    bg: "#dcfce7",
    color: "#16a34a",
    border: "#86efac",
    priority: 80,
  },
  directObject: {
    label: "直接宾语",
    bg: "#dcfce7",
    color: "#16a34a",
    border: "#86efac",
    priority: 82,
  },
  indirectObject: {
    label: "间接宾语",
    bg: "#ecfccb",
    color: "#65a30d",
    border: "#bef264",
    priority: 81,
  },
  complement: {
    label: "补足语/表语",
    bg: "#fce7f3",
    color: "#be185d",
    border: "#f9a8d4",
    priority: 75,
  },
  attribute: {
    label: "定语",
    bg: "#fef3c7",
    color: "#a16207",
    border: "#facc15",
    priority: 65,
  },
  adverbial: {
    label: "状语",
    bg: "#f3e8ff",
    color: "#9333ea",
    border: "#c084fc",
    priority: 60,
  },
  parenthesis: {
    label: "插入语",
    bg: "#dbeafe",
    color: "#1e3a8a",
    border: "#93c5fd",
    priority: 45,
  },
  appositive: {
    label: "同位语",
    bg: "#f3f4f6",
    color: "#111827",
    border: "#9ca3af",
    priority: 70,
  },
  clause: {
    label: "从句范围",
    bg: "transparent",
    color: "#111827",
    border: "#6b7280",
    priority: 40,
  },
  nonfinite: {
    label: "非限定动词",
    bg: "#dbeafe",
    color: "#2563eb",
    border: "#60a5fa",
    priority: 55,
  },
  parallel: {
    label: "并列",
    bg: "transparent",
    color: "#111827",
    border: "#111827",
    priority: 50,
  },
};

export function getRoleStyle(role) {
  return roleStyleMap[role] || roleStyleMap.attribute;
}
