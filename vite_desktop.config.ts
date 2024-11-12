import path from "path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const root = `${process.cwd()}`;

// https://vitejs.dev/config/
export default defineConfig({
  root: root,
  publicDir: "plugin",
  build: {
    target: "es2015",
    outDir: `${path.resolve(__dirname)}/dist/out`,
    emptyOutDir: false,
    sourcemap: false,
    minify: "esbuild",
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: true,

    rollupOptions: {
      input: {
        desktop: `${path.resolve(root, "src/ts/desktop/index.tsx")}/`,
      },
      output: {
        format: "module",
        preserveModules: false,
        manualChunks: {
          config: [`${path.resolve(root, "src/ts/desktop/index.tsx")}/`],
        },
        entryFileNames: "js/[name].js",
        assetFileNames: "js/[name][extname]",
      },
    },
  },
  esbuild: {
    drop: ["console", "debugger"],
  },
  plugins: [react()],
});
