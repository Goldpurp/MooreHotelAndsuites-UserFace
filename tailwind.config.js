/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./pages/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#C94A11",
        secondary: "#31458E",
        "background-dark": "#0A0A0A",
        "surface-dark": "#121212",
        "border-gold": "rgba(201, 74, 17, 0.2)",
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        sans: ["Montserrat", "sans-serif"],
        accent: ["Montserrat", "sans-serif"],
      },
      maxWidth: {
        luxury: "1600px",
      },
      animation: {
        "luxury-logo": "luxury-logo 5s ease-in-out infinite",
        "luxury-spin": "luxury-spin 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
      },
      keyframes: {
        "luxury-logo": {
          "0%, 100%": {
            transform: "translateY(0) scale(1)",
            boxShadow: "0 0 15px rgba(201, 74, 17, 0.2)",
          },
          "50%": {
            transform: "translateY(-6px) scale(1.03)",
            boxShadow: "0 0 35px rgba(201, 74, 17, 0.6)",
          },
        },
        "luxury-spin": {
          "0%": { transform: "rotateY(0deg) scale(1.1)" },
          "100%": { transform: "rotateY(360deg) scale(1.1)" },
        },
      },
    },
  },
  plugins: [],
};
