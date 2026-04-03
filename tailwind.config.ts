import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14233c",
        mist: "#eef3f6",
        sand: "#f5efe7",
        teal: "#1f7a78",
        coral: "#e07a5f",
        gold: "#d6a859",
      },
      boxShadow: {
        soft: "0 16px 40px rgba(20, 35, 60, 0.08)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "\"SF Pro Text\"",
          "\"SF Pro Display\"",
          "\"Helvetica Neue\"",
          "sans-serif",
        ],
        mono: ["IBM Plex Mono", "Menlo", "monospace"],
      },
    },
  },
  plugins: [forms],
};

export default config;
