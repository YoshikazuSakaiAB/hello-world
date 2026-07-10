/// <reference types="vitest" />
import { defineConfig } from "vite";
import { copyFileSync } from "node:fs";
import { resolve } from "node:path";

// manifest.json を dist/ 直下へコピーする小さなプラグイン。
// 拡張機能として読み込むには manifest がビルド出力の直下に必要。
const copyManifest = {
  name: "copy-manifest",
  closeBundle() {
    copyFileSync(
      resolve(__dirname, "manifest.json"),
      resolve(__dirname, "dist/manifest.json"),
    );
  },
};

// 素の TypeScript + DOM 構成（React は使用しない）。
// 拡張機能のプレビュー画面（preview.html）と service worker（background）をビルドする。
export default defineConfig({
  base: "./",
  plugins: [copyManifest],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        preview: resolve(__dirname, "preview.html"),
        background: resolve(__dirname, "src/background.ts"),
      },
      output: {
        // service worker はハッシュなしの固定名で dist 直下に出力する
        // （manifest.json の "background.service_worker": "background.js" と一致させる）
        entryFileNames: (chunk) =>
          chunk.name === "background" ? "background.js" : "assets/[name]-[hash].js",
      },
    },
  },
  server: {
    host: true,
    allowedHosts: true,
  },
  preview: {
    host: true,
    allowedHosts: true,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
  },
});
