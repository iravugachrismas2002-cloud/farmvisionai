import { Client } from "pg";

const cases = [
  { host: "127.0.0.1", port: 5432, user: "postgres", database: "postgres" },
  { host: "localhost", port: 5432, user: "postgres", database: "postgres" },
  { host: "::1", port: 5432, user: "postgres", database: "postgres" },
];

for (const c of cases) {
  const client = new Client({ ...c, connectTimeout: 3000 });
  try {
    await client.connect();
    const r = await client.query("SELECT datname FROM pg_database WHERE datname='farmvision_dev'");
    console.log(`OK  ${c.host}:${c.port} user=${c.user} db=${c.database} -> farmvision_dev=${r.rows.length > 0}`);
    await client.end();
  } catch (e) {
    console.log(`FAIL ${c.host}:${c.port} user=${c.user} db=${c.database} -> ${e.message}`);
  }
}
