export const fontLevelMap = {
  1: { label: "主句", fontSize: 18, fontWeight: 650, opacity: 1 },
  2: { label: "一级从句/短语", fontSize: 17, fontWeight: 560, opacity: 0.98 },
  3: { label: "二级结构", fontSize: 16, fontWeight: 500, opacity: 0.94 },
  4: { label: "三级结构", fontSize: 15, fontWeight: 460, opacity: 0.9 },
};

export const underlineStyleMap = {
  none: { label: "无线", style: {} },
  solid: { label: "实线", style: { textDecorationStyle: "solid" } },
  dotted: { label: "点线", style: { textDecorationStyle: "dotted" } },
  dashDot: { label: "点划线", style: { textDecorationStyle: "dashed" } },
  dashDotDot: { label: "双点划线", style: { textDecorationStyle: "dashed" } },
  double: { label: "双线", style: { textDecorationLine: "underline", textDecorationStyle: "double" } },
  wavy: { label: "波浪线", style: { textDecorationStyle: "wavy" } },
  doubleWavy: { label: "双波浪线", style: { textDecorationStyle: "wavy", textDecorationThickness: "2px" } },
};

export const backgroundStyleMap = {
  none: { label: "无背景", style: {} },
  nonfinite: {
    label: "非限定动词组背景",
    style: { boxShadow: "inset 0 -1.2em rgba(229, 231, 235, 0.75)" },
  },
  meaningCenter: {
    label: "意群中心词强调",
    style: { boxShadow: "inset 0 -0.45em rgba(253, 230, 138, 0.95)" },
  },
};

export const relationLabelMap = {
  modifies: "修饰",
  complements: "补充说明",
  appositiveOf: "同位对应",
  parallelWith: "并列",
  belongsToClause: "属于从句",
};
