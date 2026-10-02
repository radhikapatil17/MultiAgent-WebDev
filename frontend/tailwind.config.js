/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 12px 40px rgba(31, 41, 55, 0.08)"
      }
    }
  },
  plugins: []
};
