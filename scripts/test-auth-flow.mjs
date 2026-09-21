import { spawn } from "node:child_process";

const port = Number(process.env.AUTH_TEST_PORT || 3310);
const baseUrl = `http://127.0.0.1:${port}`;
const server = spawn("pnpm", ["run", "dev"], {
  cwd: new URL("..", import.meta.url),
  env: { ...process.env, NODE_ENV: "development", PORT: String(port) },
  stdio: ["ignore", "pipe", "pipe"],
  detached: true,
});

let output = "";
server.stdout.on("data", chunk => { output += chunk.toString(); });
server.stderr.on("data", chunk => { output += chunk.toString(); });

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function waitForServer(timeoutMs = 30_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(`${baseUrl}/login`);
      if (response.ok) return;
    } catch {
      // Server is still starting.
    }
    await sleep(300);
  }
  throw new Error(`Local server did not start.\n${output}`);
}

async function expect(name, condition, details = "") {
  if (!condition) throw new Error(`FAIL: ${name}${details ? ` — ${details}` : ""}`);
  console.log(`PASS: ${name}`);
}

async function run() {
  try {
    await waitForServer();

    const root = await fetch(`${baseUrl}/`);
    await expect("root route responds", root.status === 200, `status=${root.status}`);
    const rootHtml = await root.text();
    await expect("root route renders login copy", rootHtml.includes("Selamat datang"));

    const login = await fetch(`${baseUrl}/login`);
    await expect("login route responds", login.status === 200, `status=${login.status}`);

    const authMe = await fetch(`${baseUrl}/api/trpc/auth.me?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D`);
    const authBody = await authMe.text();
    await expect("auth.me is reachable without a session", authMe.status === 200, `status=${authMe.status}`);
    await expect("auth.me returns an unauthenticated result", authBody.includes('"json":null'), authBody.slice(0, 300));

    const missingCallback = await fetch(`${baseUrl}/api/oauth/callback`);
    await expect("OAuth callback rejects missing code/state", missingCallback.status === 400, `status=${missingCallback.status}`);

    const badState = Buffer.from(JSON.stringify({ redirectUri: `${baseUrl}/api/oauth/callback`, nonce: "not-the-browser-nonce" })).toString("base64");
    const invalidState = await fetch(`${baseUrl}/api/oauth/callback?code=test-code&state=${encodeURIComponent(badState)}`);
    await expect("OAuth callback rejects a mismatched state nonce", invalidState.status === 403, `status=${invalidState.status}`);

    console.log("\nLocal auth smoke test passed.");
    console.log("For the final interactive check, open the local login page, complete OAuth, and confirm it redirects to /dashboard.");
  } finally {
    try { process.kill(-server.pid, "SIGTERM"); } catch { server.kill("SIGTERM"); }
    await sleep(250);
    if (!server.killed) {
      try { process.kill(-server.pid, "SIGKILL"); } catch { server.kill("SIGKILL"); }
    }
  }
}

run().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  try { process.kill(-server.pid, "SIGTERM"); } catch { server.kill("SIGTERM"); }
  process.exitCode = 1;
});
