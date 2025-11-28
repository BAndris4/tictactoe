/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-10px)" },
          "40%": { transform: "translateX(10px)" },
          "60%": { transform: "translateX(-6px)" },
          "80%": { transform: "translateX(6px)" },
        },
        flashred: {
          "0%": { backgroundColor: "rgba(255,0,0,0.25)" },
          "100%": { backgroundColor: "transparent" },
        },
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
        shake: "shake 0.3s ease",
        "flash-red": "flashred 0.25s ease",
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
