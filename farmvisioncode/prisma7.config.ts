import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "backend/prisma/schema.prisma",
  migrations: {
    path: "backend/prisma/migrations",
  },
  datasource: {
    // Generation and validation do not connect to PostgreSQL. Migration commands
    // require DATABASE_URL to be configured in the local environment.
    url: process.env.DATABASE_URL ?? "",
  },
});
