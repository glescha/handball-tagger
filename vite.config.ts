import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(() => {
  const isCapacitor = !!process.env.CAPACITOR;

  return {
    base: isCapacitor ? "/" : "/handball-tagger/",
    plugins: [react()],
    server: {
      host: true,
      port: 5173,
      strictPort: true,
      hmr: false,
    },
  };
});
