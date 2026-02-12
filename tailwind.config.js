/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        canvas: { DEFAULT: "#FAF8F5" },
        surface: { DEFAULT: "#F5F2ED", raise: "#EFECE6" },
        ink: {
          DEFAULT: "#1C1917",
          secondary: "#57534E",
          tertiary: "#A8A29E",
          muted: "#D6D3D1",
        },
        sunset: { DEFAULT: "#F06428", soft: "#FEF1EB", hover: "#D9571F" },
        parked: { DEFAULT: "#4D9B6A", soft: "#EDF5F0" },
        rolling: { DEFAULT: "#D4912A", soft: "#FDF5E8" },
        match: { DEFAULT: "#D4577A", soft: "#FDF0F3" },
        danger: { DEFAULT: "#C4443A", soft: "#FDF0EE" },
      },
      fontFamily: {
        jakarta: ["PlusJakartaSans_400Regular"],
        "jakarta-medium": ["PlusJakartaSans_500Medium"],
        "jakarta-semibold": ["PlusJakartaSans_600SemiBold"],
        "jakarta-bold": ["PlusJakartaSans_700Bold"],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "32px",
        "3xl": "48px",
      },
    },
  },
  plugins: [],
};
