import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const url = "http://localhost:3100";
let occupied = false;
try { await fetch(url, { signal: AbortSignal.timeout(1000) }); occupied = true; } catch { /* Port is available. */ }
if (occupied) throw new Error("Port 3100 is already in use; stop that server before production tests.");

const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--port", "3100"], { stdio: "inherit", windowsHide: true });
const serverExit = new Promise((resolve, reject) => { server.once("exit", resolve); server.once("error", reject); });
try {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (server.exitCode !== null) throw new Error("Production server exited before becoming ready.");
    try { ready = (await fetch(url, { signal: AbortSignal.timeout(1000) })).ok; } catch { /* Retry startup. */ }
    if (ready) break;
    await delay(200);
  }
  if (!ready) throw new Error("Production server did not become ready.");
  const runner = spawn(process.execPath, ["node_modules/@playwright/test/cli.js", "test", "--config=playwright.production.config.ts"], { stdio: "inherit", windowsHide: true });
  process.exitCode = await new Promise((resolve, reject) => { runner.once("exit", code => resolve(code ?? 1)); runner.once("error", reject); });
} finally {
  if (server.exitCode === null) server.kill();
  await serverExit;
}
