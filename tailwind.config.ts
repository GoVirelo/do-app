import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          0: "#0a0b0d",
          1: "#111316",
          2: "#16191d",
          3: "#1c2026",
          4: "#252a31",
        },
        line: {
          DEFAULT: "#2a2f36",
          2: "#373d45",
        },
        fg: {
          0: "#f4f4f2",
          1: "#c9cbce",
          2: "#8a8f97",
          3: "#5a5f67",
        },
        bronze: {
          DEFAULT: "#c8893f",
          soft: "#3a2a18",
          line: "#5a3e1e",
        },
        steel: {
          DEFAULT: "#6d89a8",
          soft: "#1c2838",
        },
        oxblood: {
          DEFAULT: "#a14545",
          soft: "#301818",
        },
        forest: {
          DEFAULT: "#4a7a5e",
          soft: "#15221b",
        },
        plum: {
          DEFAULT: "#7d5a8c",
          soft: "#231828",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "SF Mono", "Menlo", "monospace"],
      },
      borderRadius: {
        r1: "4px",
        r2: "6px",
        r3: "8px",
        r4: "12px",
      },
      boxShadow: {
        "btn-primary": "inset 0 1px 0 rgba(255,255,255,0.18), 0 1px 2px rgba(0,0,0,0.4)",
        fab: "0 6px 20px rgba(200,137,63,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
        "oxblood-glow": "0 0 6px #a14545",
      },
    },
  },
  plugins: [],
};
export default config;
