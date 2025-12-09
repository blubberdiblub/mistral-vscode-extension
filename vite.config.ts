import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) =>
{
    // Determine if we're in production mode
    const isProduction = mode === 'production';

    return {
        plugins: [],

        // ============================================
        // Build Configuration
        // ============================================
        build: {
            // Library build settings
            lib: {
                entry: resolve(__dirname, 'src/extension.ts'),
                name: 'extension',
                fileName: 'extension',
                formats: ['cjs'],
            },

            // Rollup options for VS Code compatibility
            rollupOptions: {
                external: ['vscode'],
                output: {
                    // At build time, prevent Vite from adding a "default" import to `vscode`
                    // This ensures the bundle will be compatible with CommonJS.
                    // Otherwise, the `vscode` import will be `import vscode from 'vscode'`
                    // instead of `import * as vscode from 'vscode'`.
                    // See also: https://rollupjs.org/configuration-options/#output-interop
                    interop: 'default',
                    // Do not preserve module structure (create single bundle)
                    preserveModules: false,
                },
            },

            // Basic build settings
            assetsInlineLimit: 0,
            emptyOutDir: true,
            outDir: 'dist',

            // ============================================
            // Environment-Specific Settings
            // ============================================
            // Minification: disabled for development, enabled for production
            minify: isProduction ? 'esbuild' : false,
            // Source maps: inline for development, hidden for production
            sourcemap: isProduction ? 'hidden' : 'inline',
            // Report compressed size in production builds
            reportCompressedSize: isProduction,
        },

        // ============================================
        // Development Optimizations
        // ============================================
        optimizeDeps: {
            include: [],
            exclude: ['vscode'],
        },

        // ============================================
        // Build Performance
        // ============================================
        cacheDir: '.vite-cache',
    };
});
