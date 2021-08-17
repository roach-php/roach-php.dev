const shiki = require("shiki");

export default {
  // Target: https://go.nuxtjs.dev/config-target
  target: "static",

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: "docs",
    htmlAttrs: {
      lang: "en",
      class: "h-full",
    },
    bodyAttrs: {
      class: "bg-gray-50",
    },
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { hid: "description", name: "description", content: "" },
      { name: "format-detection", content: "telephone=no" },
    ],
    link: [
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    "@nuxt/typescript-build",
    // https://go.nuxtjs.dev/tailwindcss
    "@nuxtjs/tailwindcss",
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: ["@nuxt/content"],

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {},

  content: {
    markdown: {
      async highlighter() {
        const highlighter = await shiki.getHighlighter({
          theme: "material-default",
        });

        return (rawCode, lang, { fileName }, { h, node, u }) => {
          const code = highlighter.codeToHtml(rawCode, lang);

          const children = [];

          if (fileName) {
            children.push(h(node, "span", [u("raw", fileName)]));
          }

          children.push(
            h(node, "div", { className: "rounded-xl overflow-hidden my-6" }, [
              u("raw", code),
            ])
          );

          return h(node, "div", children);
        };
      },
    },
  },
};
