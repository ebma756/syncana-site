import os from "node:os";
import process from "node:process";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";

function getLanIPv4() {
  const interfaces = os.networkInterfaces();
  for (const entries of Object.values(interfaces)) {
    if (!entries) continue;
    for (const entry of entries) {
      if (!entry) continue;
      if (entry.family !== "IPv4") continue;
      if (entry.internal) continue;
      return entry.address;
    }
  }
  return null;
}

// Bind to all interfaces by default so both localhost (desktop) and LAN IP (phone) work.
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = process.env.PORT || "3001";
const lanIp = getLanIPv4();

// In npm workspaces, Next is often hoisted to the repo root.
// Resolving via Node's module resolution makes this work in both layouts.
const require = createRequire(import.meta.url);
let nextCli;
try {
  nextCli = require.resolve("next/dist/bin/next");
} catch (error) {
  console.error(
    `Could not resolve Next.js CLI. Try running \"npm install\" at the repo root.`
  );
  throw error;
}

console.log(`Starting Next dev server for LAN testing...`);
console.log(`Local:   http://localhost:${port}`);
console.log(`Network: http://${lanIp ?? "YOUR_LAN_IP"}:${port}`);
console.log(`Tip: open the Network URL on your phone (same Wi-Fi).`);

const child = spawn(process.execPath, [nextCli, "dev", "--webpack", "--hostname", hostname, "--port", port], {
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
