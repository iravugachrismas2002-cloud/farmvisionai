import fs from "fs";

const targets = [
  "C:\\Users\\user\\.git",
  "C:\\Users\\user\\.git\\HEAD",
  "C:\\Users\\user\\farmvisioncode\\.git",
  "C:\\Users\\user",
];

for (const t of targets) {
  try {
    const st = fs.statSync(t);
    console.log(`STAT OK  ${t}  isDirectory=${st.isDirectory()} size=${st.size}`);
  } catch (e) {
    console.log(`STAT FAIL ${t}  code=${e.code} message=${e.message}`);
  }
}

try {
  const entries = fs.readdirSync("C:\\Users\\user\\.git");
  console.log("READDIR OK C:\\Users\\user\\.git ->", entries.slice(0, 10));
} catch (e) {
  console.log("READDIR FAIL C:\\Users\\user\\.git  code=", e.code, e.message);
}
