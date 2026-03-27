import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        sand: "#f5f1e8",
        ink: "#151515",
        bronze: "#9d6f3e",
        mist: "#ece6d9",
        forest: "#325245"
      },
      boxShadow: {
        card: "0 20px 60px rgba(21, 21, 21, 0.08)"
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
