import { createVuetify, type ThemeDefinition } from "vuetify";

const terrariaPalette: ThemeDefinition = {
  dark: true,
  colors: {
    primary: "#F38C4F", // orange-ish color used for the player's health bar
    secondary: "#7C5B32", // brown color used for the background
    accent: "#87E2FB", // light blue color used for the mana bar
    error: "#F44336", // red color used for damage indicators
    warning: "#FF9800", // yellow color used for warning messages
    info: "#2196F3", // blue color used for informational messages
    success: "#4CAF50", // green color used for successful actions
  },
};

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    ssr: true,
    theme: {
      defaultTheme: "dark",
      themes: {
        dark: {
          ...terrariaPalette,
        },
      },
    },
  });

  nuxtApp.vueApp.use(vuetify);
});
