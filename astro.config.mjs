import { defineConfig } from "astro/config";
import { astroFont } from "astro-font/integration";

export default defineConfig({
    site: "https://amblelabs.dev",
    integrations: [astroFont()],
    build: {
        inlineStylesheets: "always",
    },
    experimental: {
        svgo: true,
    },
});
