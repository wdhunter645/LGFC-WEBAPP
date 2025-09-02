import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://lougehrigfanclub.com",
  integrations: [tailwind(), sitemap(), react()],
  output: "static",
  build: {
    // Enable build optimizations
    inlineStylesheets: "auto",
  },
  vite: {
    build: {
      // Enable tree shaking
      rollupOptions: {
        output: {
          manualChunks: {
            // Split vendor code for better caching
            vendor: ['react', 'react-dom'],
            supabase: ['@supabase/supabase-js', '@supabase/ssr']
          }
        }
      },
      // Enable source maps for production debugging (small size)
      sourcemap: false,
      // Minimize for production
      minify: 'esbuild',
      // Target modern browsers for smaller builds  
      target: 'es2022'
    },
    optimizeDeps: {
      // Pre-bundle dependencies for faster dev starts
      include: ['react', 'react-dom', '@supabase/supabase-js']
    }
  }
});
