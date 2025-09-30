const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./src/**/**/*.{html,ts}",
    "./src/*.{html,ts}",
  ],
  theme: {
    fontFamily: {
      fustat: ["Fustat", "sans-serif"],
      serif: ['"Times New Roman"', "serif"],
      mono: ["monospace"],
    },
    extend: {
      colors: {
        cyanBlue: "#3fc9b2",
        brownBlue: "#1f3d76",
        blackBlue: "#101828",
        lightGray: "#f9fafb",
        grayBlue: "#475467",
        darkGrayBlue: "#344054",
        veryLightGray: "#f2f4f7",
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities, theme, e }) {
      const spacing = theme("spacing"); // Tailwind's spacing scale
      const newUtilities = {};

      Object.keys(spacing).forEach((key) => {
        newUtilities[
          `.space-x-rtl-${e(key)} > :not([hidden]) ~ :not([hidden])`
        ] = {
          "--tw-space-x-reverse": "0",
          "margin-left": "calc(var(--tw-space-x-reverse) * 0px)",
          "margin-right": `calc(${spacing[key]} * calc(1 - var(--tw-space-x-reverse)))`,
        };
      });

      addUtilities(newUtilities, ["responsive"]);
    }),
  ],
};
