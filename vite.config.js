import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url"; // <-- IMPORT THIS

// --- THIS IS THE FIX for __dirname ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// --- END OF FIX ---

const HOSTNAME = "https://proofdeck.app";
const ROUTES = [
  "/",
  "/signup",
  "/login",
  "/pricing",
  "/contact",
  "/search",
  "/verify",
  "/docs",
];

export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://1227.0.0.1:5000",
        changeOrigin: true,
      },
    },
  },
});
