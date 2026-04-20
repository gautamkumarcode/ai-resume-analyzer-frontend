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
				primary: {
					50: "#f0f9ff", // Very light blue
					100: "#e0f2fe", // Light blue
					200: "#bae6fd", // Lighter blue
					300: "#7dd3fc", // Light blue
					400: "#38bdf8", // Medium blue (from logo)
					500: "#0ea5e9", // Main blue (from logo)
					600: "#0284c7", // Darker blue
					700: "#0369a1", // Dark blue
					800: "#075985", // Very dark blue
					900: "#0c4a6e", // Darkest blue
				},
				secondary: {
					50: "#faf5ff", // Very light purple
					100: "#f3e8ff", // Light purple
					200: "#e9d5ff", // Lighter purple
					300: "#d8b4fe", // Light purple
					400: "#c084fc", // Medium purple
					500: "#a855f7", // Main purple (from logo)
					600: "#9333ea", // Darker purple
					700: "#7c3aed", // Dark purple
					800: "#6b21a8", // Very dark purple
					900: "#581c87", // Darkest purple
				},
				// Gradient colors for special use
				brand: {
					blue: "#38bdf8", // Logo blue
					purple: "#a855f7", // Logo purple
					gradient: "linear-gradient(135deg, #38bdf8 0%, #a855f7 100%)",
				},
			},
			backgroundImage: {
				"brand-gradient": "linear-gradient(135deg, #38bdf8 0%, #a855f7 100%)",
				"brand-gradient-hover":
					"linear-gradient(135deg, #0ea5e9 0%, #9333ea 100%)",
			},
		},
	},
	plugins: [],
};

export default config;
