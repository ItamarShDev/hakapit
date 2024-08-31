import type { Config } from "tailwindcss";
module.exports = {
	darkMode: ["class", "[data-theme=dark]"],
	mode: "jit",
	content: ["./app/**/*.{js,jsx,ts,tsx}", "./@/**/*.{ts,tsx,js,jsx}"],
	theme: {
		container: {
			center: true,
			padding: "2rem",
			screens: {
				"2xl": "1400px",
			},
		},
		extend: {
			transitionProperty: {
				height: "height",
			},
			gridTemplateColumns: {
				"auto-1fr": "auto 1fr",
				"auto-1fr-auto": "auto 1fr auto",
			},
			gridTemplateRows: {
				"auto-1fr": "auto 1fr",
				"1fr-auto": "1fr auto",
				"auto-1fr-auto": "auto 1fr auto",
			},
			brightness: {
				20: ".2",
				30: ".3",
				40: ".4",
			},
			colors: {
				accent: "hsl(var(--color-accent))",
				primary: "hsl(var(--color-primary))",
				"primary-opaque": "hsl(var(--color-primary-opaque))",
				secondary: "hsl(var(--color-secondary))",
				paragraph: "hsl(var(--color-text))",
				background: "hsl(var(--color-background))",
				popover: "hsl(var(--color-popover))",
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			keyframes: {
				"accordion-down": {
					from: { height: "0" },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: "0" },
				},
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
			},
		},
	},
	plugins: [],
} satisfies Config;
