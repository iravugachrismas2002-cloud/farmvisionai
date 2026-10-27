import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@modules": fileURLToPath(new URL("./src/modules", import.meta.url)),
      "@server": fileURLToPath(new URL("./src/server", import.meta.url)),
      "@db": fileURLToPath(new URL("./src/server/db", import.meta.url)),
      "@analytics": fileURLToPath(new URL("./src/modules/analytics", import.meta.url)),
      "@alerts": fileURLToPath(new URL("./src/modules/alerts", import.meta.url)),
      "@farms": fileURLToPath(new URL("./src/modules/farms", import.meta.url)),
      "@devices": fileURLToPath(new URL("./src/modules/devices", import.meta.url)),
      "@recommendations": fileURLToPath(new URL("./src/modules/recommendations", import.meta.url)),
      "@intelligence": fileURLToPath(new URL("./src/modules/intelligence", import.meta.url)),
      "@digital-twin": fileURLToPath(new URL("./src/modules/digital-twin", import.meta.url)),
      "@advisory": fileURLToPath(new URL("./src/modules/advisory", import.meta.url)),
      "@marketplace": fileURLToPath(new URL("./src/modules/marketplace", import.meta.url)),
      "@automation": fileURLToPath(new URL("./src/modules/automation", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
  },
});