export const tokens = {
  bg0: "#0a0b0d",
  bg1: "#111316",
  bg2: "#16191d",
  bg3: "#1c2026",
  bg4: "#252a31",
  line: "#2a2f36",
  line2: "#373d45",
  fg0: "#f4f4f2",
  fg1: "#c9cbce",
  fg2: "#8a8f97",
  fg3: "#5a5f67",
  bronze: "#c8893f",
  bronzeSoft: "#3a2a18",
  bronzeLine: "#5a3e1e",
  steel: "#6d89a8",
  steelSoft: "#1c2838",
  oxblood: "#a14545",
  oxbloodSoft: "#301818",
  forest: "#4a7a5e",
  forestSoft: "#15221b",
  plum: "#7d5a8c",
  plumSoft: "#231828",
  amber: "#d4a55a",
  amberSoft: "#2a1f10",
} as const;

export type Source = "granola" | "slack" | "outlook" | "personal" | "manual";

export const sourceTokens: Record<Source, { fg: string; bg: string; line: string; label: string }> = {
  granola:  { fg: "#d4a55a", bg: "#2a1f10", line: "#4d3920", label: "Granola" },
  slack:    { fg: "#a77bb8", bg: "#241a2a", line: "#3d2b47", label: "Slack" },
  outlook:  { fg: "#7092b8", bg: "#172032", line: "#2a3a54", label: "Outlook" },
  personal: { fg: "#8a8f97", bg: "#1c2026", line: "#373d45", label: "Personal" },
  manual:   { fg: "#5a5f67", bg: "#13151a", line: "#2a2f36", label: "Manual" },
};
