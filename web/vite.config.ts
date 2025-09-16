import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { compression } from "vite-plugin-compression2";

// @ts-ignore
import tailwindcss from "@tailwindcss/vite";

// See <https://vitejs.dev/config/>
export default defineConfig(({ command, mode }) => {
  const envConfig = loadEnv(mode, "./");
  return {
    base: envConfig.VITE_PUBLIC_PATH || "/",
    mode: envConfig.VITE_NODE_ENV,
    plugins: [
      react(),
      svgr(),
      tailwindcss(),
      compression({ algorithms: ["gzip", "brotliCompress"] }),
    ],
    server: {
      open: true,
      port: 7000,
      base: "/",
      proxy: {
        // "/metrics": {
        //   target: "http://127.0.0.1:8000",
        //   changeOrigin: true,
        // },
        "/api": {
          target: "http://127.0.0.1:8080",
          changeOrigin: true,
          headers: {
            "X-Forwarded-User": "dev",
            "X-Forwarded-Email": "dev@zjuici.com",
            "X-Forwarded-Preferred-Username": "dev",
          },
          ws: true,
        },
      },
    },
    resolve: {
      alias: {
        "@/": "/src/",
        "micromark-extension-math": "micromark-extension-llm-math",
      },
    },
    define: {
      "process.env": envConfig,
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
      },
    },
    esbuild: {
      drop: mode === "production" ? ["console", "debugger"] : [],
    },
  };
});
