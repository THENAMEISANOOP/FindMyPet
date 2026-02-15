import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          beige: "#F5EFE6",
          sand: "#E8D8C3",
          charcoal: "#2F2F2F",
          lime: "#C7F464",
          teal: "#1B9AAA",
          "teal-dark": "#137a7a", // Darker shade for hover
        },
      },
    },
  },
  plugins: [],
};
export default config;