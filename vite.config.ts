import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(() => {
  const isCodespaces =
    !!process.env.CODESPACES ||
    !!process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN;

  return {
    plugins: [react()],
    server: {
      host: true,
      port: 5173,
      strictPort: true,
      // stoppar reload/loop i Codespaces
      hmr: isCodespaces ? false : true,
    },
  };
});
