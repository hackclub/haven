import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig(() => {
  return {
    plugins: [tailwindcss(), sveltekit()],
    server: {
      watch: {
        ignored: ["**/.direnv/**"],
      },
    },
    optimizeDeps: {
      exclude: [".direnv", 'maplibre-gl'],
    },
    // MapLibre asks for its worker with `{ type: "module" }`, so the chunk
    // Vite emits for it has to be ESM rather than the default IIFE.
    worker: {
      format: "es" as const,
    },
  };
});
