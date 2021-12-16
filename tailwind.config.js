const colors = require("tailwindcss/colors");
const plugin = require("tailwindcss/plugin");

module.exports = {
  mode: "jit",
  content: [
    "./components/**/*.vue",
    "./pages/**/*.vue",
    "./layouts/**/*.vue",
    "./nuxt.config.js",
  ],
  darkMode: "class", // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        gray: colors.slate,
        cyan: colors.cyan,
      },

      typography: (theme) => ({
        DEFAULT: {
          css: {
            a: {
              color: theme("colors.cyan.800"),
            },
            pre: {
              borderRadius: 0,
              marginTop: 0,
              marginBottom: 0,
              padding: "0.75rem 1.2rem",
            },
            code: {
              backgroundColor: theme("colors.gray.200"),
              padding: "0.25rem 0.5rem",
              borderRadius: "0.375rem",
              color: theme("colors.cyan.800"),
              fontWeight: 500,
            },
            "code::before": false,
            "code::after": false,
          },
        },
      }),
    },
    fontFamily: {
      sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
    },
  },
  plugins: [
    require("@tailwindcss/typography")({ target: "legacy" }),
    plugin(function ({ addVariant, e }) {
      addVariant("current", ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => {
          return `.nuxt-link-active.${e(`current${separator}${className}`)}`;
        });
      });

      addVariant("exact", ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => {
          return `.nuxt-link-exact-active.${e(
            `exact${separator}${className}`
          )}`;
        });
      });
    }),
  ],
};
