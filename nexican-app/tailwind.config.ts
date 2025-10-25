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
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--primary)",
        "primary-light": "var(--primary-light)",
        secondary: "var(--secondary)",
        accent: "var(--accent)",
      },
      fontFamily: {
        sans: ["var(--font-archivo-black)"],
        mono: ["var(--font-roboto-mono)"],
      },
      animation: {
        "slide-down": "slideDown 0.2s ease-out",
        "slide-up": "slideUp 0.2s ease-out",
        "bounce-in": "bounceIn 0.3s ease-out",
        glow: "glow 2s ease-in-out infinite alternate",
        float: "float 3s ease-in-out infinite",
      },
      keyframes: {
        slideDown: {
          "0%": {
            transform: "translateY(0px)",
            boxShadow: "4px 4px 0px 0px rgba(0,0,0,0.1)",
          },
          "100%": {
            transform: "translateY(2px)",
            boxShadow: "2px 2px 0px 0px rgba(0,0,0,0.1)",
          },
        },
        slideUp: {
          "0%": {
            transform: "translateY(2px)",
            boxShadow: "2px 2px 0px 0px rgba(0,0,0,0.1)",
          },
          "100%": {
            transform: "translateY(0px)",
            boxShadow: "4px 4px 0px 0px rgba(0,0,0,0.1)",
          },
        },
        bounceIn: {
          "0%": { transform: "scale(0.95)", opacity: "0.8" },
          "50%": { transform: "scale(1.02)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(95, 113, 97, 0.3)" },
          "100%": {
            boxShadow:
              "0 0 20px rgba(95, 113, 97, 0.6), 0 0 30px rgba(95, 113, 97, 0.4)",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      boxShadow: {
        neobrutal: "4px 4px 0px 0px rgba(0,0,0,0.1)",
        "neobrutal-hover": "6px 6px 0px 0px rgba(0,0,0,0.15)",
        "neobrutal-pressed": "2px 2px 0px 0px rgba(0,0,0,0.1)",
        "neobrutal-lg": "8px 8px 0px 0px rgba(0,0,0,0.1)",
        "neobrutal-xl": "12px 12px 0px 0px rgba(0,0,0,0.1)",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #5f7161 0%, #6d8b74 100%)",
        "gradient-secondary":
          "linear-gradient(135deg, #efead8 0%, #d0c9c0 100%)",
        "gradient-accent": "linear-gradient(135deg, #4a5568 0%, #2d3748 100%)",
        "gradient-text":
          "linear-gradient(135deg, #5f7161 0%, #6d8b74 50%, #4a5568 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
