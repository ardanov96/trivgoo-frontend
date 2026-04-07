import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; 

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    server: {
      port: 3000,
      host: false,
      strictPort: true,
      proxy: {
        '/api': {
          target: 'http://localhost:4001',
          changeOrigin: true,
          secure: false,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('❌ Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('📤 Proxying:', req.method, req.url, '→ http://localhost:4000');
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('📥 Response:', proxyRes.statusCode, req.url);
            });
          },
        }
      }
    },
    plugins: [react(), tailwindcss()],
    define: {
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GOOGLE_MAPS_API_KEY": JSON.stringify(env.GOOGLE_MAPS_API_KEY),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
        "victory-vendor/es/d3-array": path.resolve(__dirname, "node_modules/victory-vendor/es/d3-array.js"),
        "victory-vendor/es/d3-scale": path.resolve(__dirname, "node_modules/victory-vendor/es/d3-scale.js"),
        "victory-vendor/es/d3-shape": path.resolve(__dirname, "node_modules/victory-vendor/es/d3-shape.js"),
        "victory-vendor/es/d3-ease": path.resolve(__dirname, "node_modules/victory-vendor/es/d3-ease.js"),
        "victory-vendor/es/d3-interpolate": path.resolve(__dirname, "node_modules/victory-vendor/es/d3-interpolate.js"),
        "victory-vendor/es/d3-color": path.resolve(__dirname, "node_modules/victory-vendor/es/d3-color.js"),
        "victory-vendor/es/d3-time": path.resolve(__dirname, "node_modules/victory-vendor/es/d3-time.js"),
        "victory-vendor/es/d3-timer": path.resolve(__dirname, "node_modules/victory-vendor/es/d3-timer.js"),
      },
    },
    optimizeDeps: {
      include: [
        'recharts',
        'victory-vendor/es/d3-array',
        'victory-vendor/es/d3-scale',
        'victory-vendor/es/d3-shape',
        'victory-vendor/es/d3-ease',
        'victory-vendor/es/d3-interpolate',
        'victory-vendor/es/d3-color',
        'victory-vendor/es/d3-time',
        'victory-vendor/es/d3-timer',
      ],
    },
    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // core-js polyfills
            if (id.includes('node_modules/core-js')) {
              return 'vendor-polyfill';
            }

            // canvg & deps (dibawa jspdf)
            if (
              id.includes('node_modules/canvg') ||
              id.includes('node_modules/svg-parser') ||
              id.includes('node_modules/rgbcolor')
            ) {
              return 'vendor-pdf';
            }

            // Firebase
            if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) {
              return 'vendor-firebase';
            }

            // PDF & Canvas
            if (id.includes('node_modules/jspdf') || id.includes('node_modules/html2canvas')) {
              return 'vendor-pdf';
            }

            // Map
            if (id.includes('node_modules/leaflet') || id.includes('node_modules/react-leaflet')) {
              return 'vendor-map';
            }

            // ── FIX: d3 + recharts WAJIB satu chunk ──
            // Memisahkan d3 ke chunk tersendiri menyebabkan race condition:
            // browser bisa load vendor-charts sebelum vendor-d3 selesai,
            // sehingga variabel internal d3 (diminify jadi 'P') belum
            // terdefinisi → ReferenceError → blank white page.
            if (
              id.includes('node_modules/d3-')           ||
              id.includes('node_modules/d3/')            ||
              id.includes('node_modules/recharts')       ||
              id.includes('node_modules/react-smooth')   ||
              id.includes('node_modules/victory-vendor')
            ) {
              return 'vendor-charts';
            }

            // Google AI
            if (id.includes('node_modules/@google/genai')) {
              return 'vendor-genai';
            }

            // Core React
            if (
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react-router-dom') ||
              id.includes('node_modules/react/')
            ) {
              return 'vendor-react';
            }

            // Animation
            if (id.includes('node_modules/framer-motion')) {
              return 'vendor-motion';
            }

            // i18n runtime
            if (id.includes('node_modules/i18next') || id.includes('node_modules/react-i18next')) {
              return 'vendor-i18n';
            }

            // UI
            if (id.includes('node_modules/lucide-react') || id.includes('node_modules/sweetalert2')) {
              return 'vendor-ui';
            }

            // Misc
            if (
              id.includes('node_modules/axios')              ||
              id.includes('node_modules/react-datepicker')   ||
              id.includes('node_modules/react-markdown')     ||
              id.includes('node_modules/qrcode.react')       ||
              id.includes('node_modules/hashids')            ||
              id.includes('node_modules/react-helmet-async') ||
              id.includes('node_modules/micromark')          ||
              id.includes('node_modules/date-fns')           ||
              id.includes('node_modules/@floating-ui')
            ) {
              return 'vendor-misc';
            }
          },
        },
      },
    },
  };
});
