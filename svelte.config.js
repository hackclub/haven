import adapter from "@sveltejs/adapter-node";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

export default {
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter(),

    // Our own same-origin check lives in src/hooks.server.ts so the routes
    // Airtable, Fillout and Slack call can be exempted by path — SvelteKit's
    // built-in check has no such escape hatch.
    csrf: { checkOrigin: false },
  },
};
