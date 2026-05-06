import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        shell: {
          950: "#050816",
          900: "#091022",
          800: "#101a32",
          700: "#18264a"
        },
        accent: {
          cyan: "#64f1ff",
          blue: "#58a6ff",
          pink: "#ff7fe0",
          red: "#ff5f73"
        }
      },
      boxShadow: {
        glow: "0 0 40px rgba(100, 241, 255, 0.25)"
      },
      fontFamily: {
        display: ["ui-sans-serif", "system-ui", "sans-serif"]
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, -10px, 0)" }
        }
      },
      animation: {
        drift: "drift 5s ease-in-out infinite"
      }
    }
  },
  plugins: []
} satisfies Config;
