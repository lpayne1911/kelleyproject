import type { Config } from "tailwindcss";

// Brand tokens lifted directly from the Driveway Advocate deck.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#14253D", // deep navy — authority / protection
        "ink-soft": "#1E3552",
        paper: "#FCFBF8", // warm paper white
        "paper-2": "#F4F1EA", // faint panel
        slate: "#52647A", // body text
        "slate-light": "#7A8A9C", // captions
        gold: "#C8923A", // "protected / saved" accent
        "gold-deep": "#A8761F",
        risk: "#B23A3A", // junk-fee / risk only
        line: "#D9D3C7", // hairlines
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
