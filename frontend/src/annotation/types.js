export const ANNOTATION_ROLES = [
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

export const ROLE_ALIASES = {
  modifier: "attribute",
  conjunction: "parallel",
  parenthetical: "parenthesis",
};

export const UNDERLINE_STYLES = [
  "none",
  "solid",
  "dotted",
  "dashDot",
  "dashDotDot",
  "double",
  "wavy",
  "doubleWavy",
];

export const BACKGROUND_STYLES = ["none", "nonfinite", "meaningCenter"];

export const RELATIONS = [
  "modifies",
  "complements",
  "appositiveOf",
  "parallelWith",
  "belongsToClause",
];

/**
 * @typedef {Object} SentenceAnnotation
 * @property {string} id
 * @property {number} start
 * @property {number} end
 * @property {string} role
 * @property {1|2|3|4} fontLevel
 * @property {string} underlineStyle
 * @property {string} backgroundStyle
 * @property {string|null=} relation
 * @property {string|null=} targetId
 * @property {string|null=} parentId
 * @property {string|null=} groupId
 * @property {boolean=} isContainer
 * @property {string=} labelZh
 * @property {string=} explanationZh
 * @property {number=} priority
 */
