import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      typography: {
        invert: {
          css: {
            "--tw-prose-body": "#e2e8f0",
            "--tw-prose-headings": "#f8fafc",
            "--tw-prose-links": "#67e8f9",
            "--tw-prose-bold": "#f8fafc",
            "--tw-prose-quotes": "#cbd5e1",
            "--tw-prose-quote-borders": "rgba(100,241,255,0.3)",
            "--tw-prose-code": "#67e8f9",
            "--tw-prose-hr": "rgba(255,255,255,0.1)",
            "--tw-prose-th-borders": "rgba(255,255,255,0.15)",
            "--tw-prose-td-borders": "rgba(255,255,255,0.08)",
            maxWidth: "none",
            code: {
              backgroundColor: "rgba(255,255,255,0.08)",
              borderRadius: "0.375rem",
              padding: "0.15em 0.4em",
              fontWeight: "500"
            },
            "code::before": { content: "none" },
            "code::after": { content: "none" },
            pre: { all: "unset" }
          }
        }
      },
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
          violet: "#8f8bff",
          red: "#ff5f73"
        }
      },
      boxShadow: {
        glow: "0 0 40px rgba(100, 241, 255, 0.25)",
        "glow-soft": "0 0 60px rgba(100, 241, 255, 0.12)",
        "glow-violet": "0 0 60px rgba(143, 139, 255, 0.18)",
        "glow-red": "0 0 50px rgba(255, 95, 115, 0.2)"
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
  plugins: [typography]
} satisfies Config;
