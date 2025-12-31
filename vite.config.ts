import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(() => {
  const isCodespaces =
    !!process.env.CODESPACES ||
    !!process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN;

  // Sätts i GitHub Actions när vi bygger APK
  const isCapacitor = process.env.VITE_TARGET === "capacitor";

  return {
    base: isCapacitor ? "./" : "/handball-tagger/",
    plugins: [react()],
    server: {
      host: true,
      port: 5173,
      strictPort: true,
      hmr: isCodespaces ? false : true,
    },
  };
});
