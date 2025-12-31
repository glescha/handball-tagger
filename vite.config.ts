import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(() => {
  const isCodespaces =
    !!process.env.CODESPACES ||
    !!process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN;

  // När vi bygger APK vill vi INTE ha /handball-tagger/ utan relative paths
  const isCapacitorBuild =
    process.env.CAPACITOR === "true" ||
    process.env.CAPACITOR_PLATFORM === "android" ||
    process.env.GITHUB_ACTIONS === "true";

  return {
    base: isCapacitorBuild ? "./" : "/handball-tagger/",
    plugins: [react()],
    server: {
      host: true,
      port: 5173,
      strictPort: true,
      hmr: isCodespaces ? false : true,
    },
  };
});
