// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import node from "@astrojs/node";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },

  output: "server",

  adapter: node({
    mode: "standalone",
  }),

  security: {
    checkOrigin: false,
  },

  redirects: {
    '/shirt': 'https://haven.hackclub.com',
  },
});
