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
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          light: "var(--accent-light)",
        },
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
        chartHue: "var(--chart-1)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.05)',
        'modal': '0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.08)',
      },
      borderRadius: {
        card: "10px",
        control: "8px",
      },
    },
  },
  plugins: [],
};
