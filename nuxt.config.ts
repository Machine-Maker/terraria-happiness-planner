// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify from "vite-plugin-vuetify";

export default defineNuxtConfig({
  ssr: true,
  css: ["vuetify/styles", "@mdi/font/css/materialdesignicons.css"],
  build: {
    transpile: ["vuetify"],
  },
  app: {
    head: {
      title: "Terraria - NPC Planner",
      meta: [
        { name: "author", content: "Machine Maker" },
        { name: "description", content: "A planning tool to setup Terraria NPCs to get the happiness values you want." },
        { name: "og:title", content: "Terraria - NPC Planner" },
        { name: "og:description", content: "A planning tool to setup Terraria NPCs to get the happiness values you want." },
        { name: "theme-color", content: "#F38C4F" },
        { name: "msapplication-TileColor", content: "#F38C4F" },
      ],
      link: [
        { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
        { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
        { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
        { rel: "manifest", href: "/site.webmanifest" },
      ],
    },
  },
  modules: [
    async (options, nuxt) => {
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        if (config.plugins) {
          config.plugins.push(vuetify({ autoImport: true }));
        }
      });
    },
  ],
});
