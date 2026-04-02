// @ts-check
import { defineConfig } from "astro/config";
import { astroFont } from "astro-font/integration";

// https://astro.build/config
export default defineConfig({
  integrations: [astroFont()],
  experimental: {
    svgo: true,
  },
});
