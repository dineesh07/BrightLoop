/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ground: "var(--ground)",
        surface: "var(--surface)",
        raised: "var(--raised)",
        border: "var(--border)",
        rule: "var(--rule)",
        text: "var(--text)",
        muted: "var(--muted)",
        accent: "var(--accent)",
        positive: {
          DEFAULT: "var(--positive)",
          bg: "var(--pill-positive-bg)",
          ink: "var(--pill-positive-ink)",
        },
        negative: {
          DEFAULT: "var(--negative)",
          bg: "var(--pill-negative-bg)",
          ink: "var(--pill-negative-ink)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          bg: "var(--pill-warning-bg)",
          ink: "var(--pill-warning-ink)",
        },
        chartHue: "var(--chart-3)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      borderRadius: {
        card: "8px",
        control: "6px",
      },
    },
  },
  plugins: [],
};

