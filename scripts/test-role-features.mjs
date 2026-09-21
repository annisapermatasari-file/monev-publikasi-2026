const base = process.env.TEST_BASE ?? "http://127.0.0.1:3000";
const admin = { username: "riri", password: "MonevSuper2026!" };
const petugas = { username: "petugas.demo", password: "PetugasUji2026!" };
const resetPassword = "PetugasReset2026!";

function unwrap(payload) {
  const item = Array.isArray(payload) ? payload[0] : payload;
  return item?.result?.data?.json ?? item?.result?.data ?? item?.error?.json ?? item;
}

async function call(path, input, cookie, method = "GET") {
  const query = encodeURIComponent(JSON.stringify({ 0: { json: input } }));
  const url = `${base}/api/trpc/${path}?batch=1${method === "GET" ? `&input=${query}` : ""}`;
  const response = await fetch(url, {
    method,
    headers: { "content-type": "application/json", ...(cookie ? { cookie } : {}) },
    body: method === "POST" ? JSON.stringify({ 0: { json: input } }) : undefined,
  });
  const text = await response.text();
  let payload;
  try { payload = JSON.parse(text); } catch { payload = text; }
  if (!response.ok) throw new Error(`${path} ${response.status}: ${text.slice(0, 400)}`);
  return { data: unwrap(payload), raw: payload };
}

async function login(credentials) {
  const response = await fetch(`${base}/api/trpc/auth.localLogin?batch=1`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ 0: { json: credentials } }),
  });
  const setCookie = response.headers.get("set-cookie") ?? "";
  const text = await response.text();
  if (!response.ok) throw new Error(`login failed ${response.status}: ${text.slice(0, 300)}`);
  return { cookie: setCookie.split(",")[0].split(";")[0], data: unwrap(JSON.parse(text)) };
}

async function main() {
  const adminSession = await login(admin);
  const accountResponse = await call("accounts.listPetugas", null, adminSession.cookie);
  const accounts = accountResponse.data ?? [];
  const account = accounts.find((item) => item.username === petugas.username);
  if (!account) throw new Error("petugas.demo was not found");
  const reportResponse = await call("reports.list", null, adminSession.cookie);
  const report = (reportResponse.data ?? [])[0]?.report;
  if (!report) throw new Error("No report exists to assign");

  await call("reports.assign", { reportId: report.id, petugasId: account.id }, adminSession.cookie, "POST");
  const petugasSession = await login(petugas);
  const tasks = await call("tasks.mine", null, petugasSession.cookie);
  const assigned = (tasks.data ?? []).some(({ report: taskReport }) => taskReport.id === report.id && taskReport.assignedUserId === account.id);
  if (!assigned) throw new Error("Assigned report did not appear in Petugas tasks");

  await call("accounts.resetPassword", { id: account.id, password: resetPassword }, adminSession.cookie, "POST");
  await login({ username: petugas.username, password: resetPassword });
  await call("accounts.resetPassword", { id: account.id, password: petugas.password }, adminSession.cookie, "POST");
  await call("accounts.setActive", { id: account.id, isActive: false }, adminSession.cookie, "POST");
  let deactivatedLoginRejected = false;
  try { await login(petugas); } catch { deactivatedLoginRejected = true; }
  await call("accounts.setActive", { id: account.id, isActive: true }, adminSession.cookie, "POST");
  await login(petugas);
  if (!deactivatedLoginRejected) throw new Error("Deactivated account could still log in");

  console.log(JSON.stringify({ reportId: report.id, petugasId: account.id, assignment: "PASS", resetPassword: "PASS", deactivationGuard: "PASS", reactivation: "PASS" }));
}

main().catch((error) => { console.error(error.message); process.exit(1); });
