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
        brand: {
          DEFAULT: "#5638F5",
          hover: "#4528e5",
          light: "#f0edff",
          dark: "#3d1fd0",
        },
        sunburst: {
          DEFAULT: "#FF9800",
          hover: "#f57c00",
          light: "#fff7ed",
          glow: "rgba(255, 152, 0, 0.25)",
        },
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
        'subtle': '0 1px 2px 0 rgba(86, 56, 245, 0.04)',
        'card': '0 2px 8px -2px rgba(86, 56, 245, 0.06), 0 1px 3px -1px rgba(13, 12, 34, 0.04)',
        'card-hover': '0 12px 24px -6px rgba(86, 56, 245, 0.12), 0 4px 8px -2px rgba(13, 12, 34, 0.04)',
        'brand': '0 10px 25px -5px rgba(86, 56, 245, 0.35)',
        'sunburst': '0 10px 25px -5px rgba(255, 152, 0, 0.35)',
        'modal': '0 25px 50px -12px rgba(13, 12, 34, 0.25)',
      },
      borderRadius: {
        card: "12px",
        control: "8px",
      },
    },
  },
  plugins: [],
};
