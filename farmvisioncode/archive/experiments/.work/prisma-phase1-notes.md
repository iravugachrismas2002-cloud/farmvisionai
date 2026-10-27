# Prisma Phase 1 research notes

## Version and setup findings

The npm registry reported `prisma` 8.0.0-rc.23 and `@prisma/client` / `@prisma/adapter-pg` 7.10.1. Prisma's documentation identifies Prisma ORM 8 as the current release candidate and maintains a v7 stable documentation track. For a project that requires stable, mutually compatible versions, plan to pin the Prisma CLI, client, and PostgreSQL adapter to 7.10.1 unless a later stable release is confirmed before installation.

The official Prisma ORM v7 PostgreSQL quickstart uses the ESM-first `prisma-client` generator with a custom output path, `prisma.config.ts` (or the version-specific Prisma 7 config filename), a PostgreSQL driver adapter, and `pg`. It notes that Prisma 7.10+ uses a versioned Prisma 7 config filename by default to avoid conflict with the Prisma 8 config format. The Prisma config obtains `DATABASE_URL` from the process environment; Prisma CLI commands can load the config even when no connection is performed.

The local PostgreSQL target is not reachable yet. Do not apply migrations or attempt a credentialed connection until loopback readiness succeeds and a new credential is supplied through a secure input surface. The password previously pasted in chat must not be used.

## Sources

- Prisma ORM v7 PostgreSQL quickstart: https://www.prisma.io/docs/v7/prisma-orm/quickstart/postgresql
- Prisma ORM v7 config reference: https://www.prisma.io/docs/orm/v7/reference/prisma-config-reference
- Prisma ORM v7 PostgreSQL connector: https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/postgresql
- Prisma ORM Next.js guide (latest, identifies Prisma ORM 8 as a release candidate): https://www.prisma.io/docs/guides/frameworks/nextjs

## Migration workflow findings

Prisma ORM v7's CLI reference supports generating SQL without a live database using `prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script --output <file>`. This compares an empty schema with the Prisma data model and writes a draft SQL script; it does not apply the SQL. `prisma migrate dev` can inspect/reset/apply a development database and may use a shadow database, so it must not be run without the database being reachable and explicit approval. `prisma migrate deploy` applies pending migration files and also changes the target database, so it is not run in this Phase 1 code pass.

- Prisma ORM v7 CLI reference (`migrate diff`): https://www.prisma.io/docs/orm/v7/reference/prisma-cli-reference#migrate-diff
- Prisma ORM v7 development and production migration workflow: https://www.prisma.io/docs/orm/v7/prisma-migrate/workflows/development-and-production
