/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        glowPulse: {
          "0%, 100%": {
            boxShadow: "0 0 0px rgba(79,173,192,0.0)",
            transform: "scale(1)",
          },
          "50%": {
            boxShadow: "0 0 15px rgba(79,173,192,0.4)",
            transform: "scale(1.07)",
          },
        },
      },
      animation: {
        glowPulse: "glowPulse 1.2s ease-in-out infinite",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        paytone: ["Paytone One", "sans-serif"],
      },
      colors: {
        sunshine: "#FCDC73",
        coral: "#E76268",
        deepblue: "#193948",
        mint: "#4FADC0",
      },
    },
  },
  plugins: [],
};
