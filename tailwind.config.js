/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4F46E5",
        secondary: "#818CF8",
        dark: "#1A1A2E",
        gray: {
          light: "#F5F5F5",
          medium: "#9E9E9E",
          dark: "#424242",
        },
        success: "#4CAF50",
        danger: "#F44336",
        warning: "#FFC107",
      },
      fontFamily: {
        regular: ["System"],
        bold: ["System"],
      },
    },
  },
  plugins: [],
};
