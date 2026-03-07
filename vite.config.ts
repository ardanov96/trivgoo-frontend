import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    server: {
      port: 3000, // Frontend port (tetap 3000)
      host: false,
      strictPort: true,
      proxy: {
        // Proxy semua request /api ke backend
        '/api': {
          target: 'http://localhost:4001', // ← Backend port (matches .env.development PORT=4001)
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
    plugins: [react()],
    define: {
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GOOGLE_MAPS_API_KEY": JSON.stringify(
        env.GOOGLE_MAPS_API_KEY
      ),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
  };
});