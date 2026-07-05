/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // warm "lacquer" dark + restrained anchors (refined, not neon)
        ink: "#0a0a0c",
        ink2: "#131215",
        surface: "#16151a",
        brandcyan: "#5BC4D6",
        gold: "#D6B173",
        champagne: "#ECE8E0",
        body: "#C7C4BC",
        coolgray: "#94918A",
        faint: "#6A6862",
      },
      fontFamily: {
        serif: ['"Noto Serif Georgian"', "serif"],
        sans: ['"Noto Sans Georgian"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
    },
  },
  plugins: [],
};
