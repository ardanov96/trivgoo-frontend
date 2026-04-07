import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; 

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  
  return {
    // 1. Base path "/" memastikan file di /public (seperti video) terbaca dengan benar di production
    base: "/",

    server: {
      port: 3000,
      host: false,
      strictPort: true,
      proxy: {
        '/api': {
          target: 'http://localhost:4001',
          changeOrigin: true,
          secure: false,
        }
      }
    },

    // 2. Tambahkan config preview agar saat npm run preview tidak bentrok port
    preview: {
      port: 4173,
      strictPort: false,
    },

    plugins: [react(), tailwindcss()],

    define: {
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GOOGLE_MAPS_API_KEY": JSON.stringify(env.GOOGLE_MAPS_API_KEY),
    },

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },

    build: {
      // 3. Memastikan modul pendukung dimuat dengan benar oleh browser
      modulePreload: {
        polyfill: true
      },
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Core React
            if (id.includes('node_modules/react')) return 'vendor-react-core';
            
            // Firebase & GenAI
            if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) return 'vendor-firebase';
            if (id.includes('node_modules/@google/genai')) return 'vendor-genai';

            // PDF & Map
            if (id.includes('node_modules/jspdf') || id.includes('node_modules/html2canvas')) return 'vendor-pdf';
            if (id.includes('node_modules/leaflet')) return 'vendor-map';

            // --- FIX: RECHARTS & D3 ---
            // Kita pisahkan mereka agar tidak terjadi error "Cannot access before initialization"
            if (id.includes('node_modules/recharts')) return 'vendor-recharts';
            if (id.includes('node_modules/d3')) return 'vendor-d3';
            if (id.includes('node_modules/victory-vendor')) return 'vendor-victory';
            // --------------------------

            // UI & Animation
            if (id.includes('node_modules/framer-motion')) return 'vendor-motion';
            if (id.includes('node_modules/lucide-react') || id.includes('node_modules/sweetalert2')) return 'vendor-ui';

            // i18n
            if (id.includes('node_modules/i18next')) return 'vendor-i18n';
          },
        },
      },
    },
  };
});