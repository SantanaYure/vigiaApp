export const colors = {
  primary: "#2AEEEF",
  primaryDark: "#004A75",
  background: "#F2F2F2",
  surface: "#FFFFFF",
  text: "#0F0F0F",
  textSecondary: "#4A5560",
  textTertiary: "#8B9297",
  border: "#D8DBDD",
  borderSubtle: "#EEF0F0",
} as const;

export type SemanticTone = "danger" | "warning" | "success" | "info" | "neutral";

export interface ToneStyle {
  bg: string;
  text: string;
  dot: string;
}

/**
 * Derived tints per semantic tone, taken verbatim from the imported design's
 * SEV_STYLE/STATUS_STYLE maps (Vigia Prototype.dc.html). Keep in sync with
 * tokens.css if the base palette ever changes.
 */
export const tonePalette: Record<SemanticTone, ToneStyle> = {
  danger: { bg: "#FFF0F0", text: "#8A2E2E", dot: "#C64545" },
  warning: { bg: "#FFFEEA", text: "#6B6B14", dot: "#9B9B1E" },
  success: { bg: "#F0FFF0", text: "#1E6B1E", dot: "#2E8A2E" },
  info: { bg: "#F0F2FF", text: "#2B3C7D", dot: "#3B4E9C" },
  neutral: { bg: "#F7F8F8", text: "#4A5560", dot: "#8B9297" },
};
