import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/extension.ts'),
      name: 'extension',
      fileName: 'extension',
      formats: ['cjs'],
    },
    rollupOptions: {
      external: ['vscode'],
      output: {
        // At build time, prevent Vite from adding a "default" import to `vscode`
        // This ensures the bundle will be compatible with CommonJS.
        // Otherwise, the `vscode` import will be `import vscode from 'vscode'` instead of `import * as vscode from 'vscode'`
        // See also: https://rollupjs.org/configuration-options/#output-interop
        interop: 'default',
      },
    },
    outDir: 'dist',
    assetsInlineLimit: 0,
    sourcemap: 'inline',
    //minify: 'esbuild',
    minify: false,
    emptyOutDir: true,
  },
});
