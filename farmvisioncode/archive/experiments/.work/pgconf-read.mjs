import fs from "fs";

const files = [
  "C:\\Program Files\\PostgreSQL\\18\\data\\postgresql.conf",
  "C:\\Program Files\\PostgreSQL\\18\\data\\postgresql.auto.conf",
  "C:\\Program Files\\PostgreSQL\\18\\data\\pg_hba.conf",
];

for (const f of files) {
  try {
    const text = fs.readFileSync(f, "utf8");
    console.log(`===== ${f} (${text.length} bytes) =====`);
    const lines = text.split("\n");
    const relevant = lines.filter(l => /listen_addresses|port|^[^#]*host|^[^#]*local/i.test(l) && !l.trimStart().startsWith("#"));
    console.log(relevant.join("\n") || "(no matching non-comment lines)");
    console.log();
  } catch (e) {
    console.log(`===== ${f} =====`);
    console.log(`READ FAIL code=${e.code} message=${e.message}`);
    console.log();
  }
}
