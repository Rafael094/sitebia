import type { Config } from "tailwindcss";

/**
 * Configuração do Tailwind CSS com a identidade visual corporativa.
 *
 * Paleta:
 *  - navy (Azul Marinho)  : #0D1B2A -> tons escuros de confiança e técnica
 *  - gold (Dourado Champ.) : #C5A059 -> tons de sofisticação
 *  - offwhite (Fundo)      : #FAF8F5 -> fundo quente e clean
 *
 * Fontes:
 *  - font-serif (display) : Cinzel — títulos com caráter institucional
 *  - font-sans (texto)    : Montserrat — corpo de texto
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./providers/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Azul Marinho (#0D1B2A)
        navy: {
          50: "#eef2f6",
          100: "#d5dfe8",
          200: "#adc0d2",
          300: "#829cb5",
          400: "#4a6b8f",
          500: "#2c4a6b",
          600: "#1d3550",
          700: "#14283d",
          800: "#0D1B2A", // cor primária corporativa
          900: "#0a1520",
          950: "#060d14"
        },
        // Dourado Champagne (#C5A059)
        gold: {
          50: "#fbf7ef",
          100: "#f5ead4",
          200: "#e9d3a6",
          300: "#ddbd7a",
          400: "#d2ac58",
          500: "#C5A059", // cor corporativa (dourado champagne)
          600: "#a9843f",
          700: "#856634",
          800: "#6a522c",
          900: "#574426"
        },
        // Fundo Off-White (#FAF8F5)
        ivory: {
          50: "#ffffff",
          100: "#FAF8F5", // cor corporativa (fundo off-white)
          200: "#f3efe8",
          300: "#e8e0d3",
          400: "#dbcdB9"
        }
      },
      fontFamily: {
        // Cinzel para títulos (display)
        display: ["var(--font-cinzel)", "Cinzel", "serif"],
        // Montserrat para textos
        sans: ["var(--font-montserrat)", "Montserrat", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      maxWidth: {
        container: "1200px"
      },
      boxShadow: {
        card: "0 12px 30px -12px rgba(13, 27, 42, 0.18)"
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        orbit: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" }
        }
      },
      animation: {
        "fade-in-up": "fade-in-up 0.6s ease-out both",
        orbit: "orbit 12s linear infinite"
      }
    }
  },
  plugins: []
};

export default config;
