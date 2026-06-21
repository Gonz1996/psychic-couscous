// Lance `next dev` en forçant la surveillance des fichiers par polling.
// Indispensable quand le projet réside sur un lecteur réseau (SMB), où la
// surveillance native échoue (« Watchpack Error: UNKNOWN: watch ») et
// provoque une boucle de redémarrage sur next.config.ts.
process.env.WATCHPACK_POLLING = process.env.WATCHPACK_POLLING ?? "1000";
process.env.CHOKIDAR_USEPOLLING = process.env.CHOKIDAR_USEPOLLING ?? "true";

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const nextBin = path.join(here, "..", "node_modules", "next", "dist", "bin", "next");

const child = spawn(process.execPath, [nextBin, "dev"], {
  stdio: "inherit",
  env: process.env,
});
child.on("exit", (code) => process.exit(code ?? 0));
