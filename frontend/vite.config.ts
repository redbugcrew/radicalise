import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    assetsDir: "assets",
  },
  resolve: {
    alias: {
      "@tabler/icons-react": "@tabler/icons-react/dist/esm/icons/index.mjs",
    },
  },
  legacy: {
    // react-use-websocket uses exports.default (CJS) which Vite 8 no longer
    // treats as a default export under the new consistent CJS interop.
    // Remove once https://github.com/robtaussig/react-use-websocket/pull/282 is released.
    inconsistentCjsInterop: true,
  },
});
