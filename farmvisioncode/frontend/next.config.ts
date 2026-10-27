import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

const nextConfig: NextConfig = {
  distDir: ".next",
  turbopack: {
    // The workspace root contains the hoisted Next.js dependency. A local
    // workspace boundary prevents discovery from walking into C:\Users\user.
    root: fileURLToPath(new URL("..", import.meta.url)),
  },
  allowedDevOrigins: ["localhost", "127.0.0.1", "192.168.99.179"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};
export default nextConfig;
