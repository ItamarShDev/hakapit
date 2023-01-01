/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    colors: {
      primary: "var(--color-primary)",
      "primary-opaque": "var(--color-primary-opaque)",
      secondary: "var(--color-secondary)",
      accent: "var(--color-tertiary)",
      accent2: "var(--color-background)",
      paragraph: "var(--color-text)",
    },
    extend: {
      gridTemplateColumns: {
        "auto-1fr": "auto 1fr",
        "auto-1fr-auto": "auto 1fr auto",
      },
    },
  },
  plugins: [],
};
