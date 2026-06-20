import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// Resolve the engine straight from its TypeScript source so the app always
// runs against the latest engine code without a separate build step. (The
// package's published entry is dist/, which is gitignored — see package
// exports. Vite resolves the .js specifiers inside the engine to their .ts
// source automatically.)
const enginePkg = "@drivewayadvocate/warranty-engine";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      [enginePkg]: fileURLToPath(
        new URL("../../packages/warranty-engine/src/index.ts", import.meta.url),
      ),
    },
  },
  server: {
    port: 5173,
  },
});
