import { defineConfig } from "vite";

/**
 * GitHub Pages project sites are served from /<repository-name>/, while local
 * development and custom-domain deployments are served from the root path.
 */
export default defineConfig({
  base: process.env.BASE_PATH || "/",
});
