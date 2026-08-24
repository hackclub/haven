// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },

  output: "server",

  adapter: node({
    mode: "standalone",
  }),

  security: {
    // Astro's built-in check 403s any form-encoded POST whose `Origin` header
    // is not byte-identical to the request URL's origin. Slack sends no
    // `Origin` at all on slash commands and interactivity payloads, so every
    // one of them would be rejected. We run our own guard in src/middleware.ts
    // instead, which exempts the routes that authenticate their caller.
    checkOrigin: false,
  },
});
