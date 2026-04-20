import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/d3-obesity-usa/",
  plugins: [react()],
});
