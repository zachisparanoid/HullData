import type { Config } from "tailwindcss";

// Colors map to CSS variables defined in globals.css so the theme toggle
// (dark/light) only has to swap the variable set. Naming avoids awkward
// Tailwind collisions: primary text = `ink`, border color = `line`.
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/store/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        line: "var(--border)",
        ink: "var(--text)",
        muted: "var(--text-muted)",
        accent: "var(--accent)",
        "accent-strong": "var(--accent-strong)",
        amber: "var(--accent-amber)",
        danger: "var(--danger)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: [
          "var(--font-space-grotesk)",
          "var(--font-inter)",
          "sans-serif",
        ],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        panel: "10px",
        chip: "8px",
        thumb: "6px",
      },
      fontSize: {
        "table-head": ["11px", { lineHeight: "1", letterSpacing: "0.06em" }],
        badge: ["11px", { lineHeight: "1.1" }],
      },
      boxShadow: {
        drawer: "-24px 0 60px -20px rgba(0,0,0,0.55)",
        panel: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px -16px rgba(0,0,0,0.18)",
        glow: "0 0 0 1px var(--accent), 0 0 20px -4px var(--accent)",
      },
      transitionTimingFunction: {
        "out-marine": "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s infinite",
        "fade-up": "fade-up 0.35s cubic-bezier(0.22,1,0.36,1) both",
      },
    },
  },
  plugins: [],
};
export default config;
