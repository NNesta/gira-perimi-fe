// Product screenshots for the home page: real pages, drawn by Chrome at phone size, for a demo learner.
//
//   1. A throwaway API with the demo learner (prints a session token). Use a new database for every run: this script
//      starts an exam, which would show up in the next run's pictures.
//        cd ../gira-perimi-be && uv run python -m scripts.demo_screens /tmp/tsinda-demo.db > /tmp/tsinda-token
//        DATABASE_URL=sqlite+aiosqlite:////tmp/tsinda-demo.db uv run uvicorn app.main:app --port 8000
//   2. This site, built and started against it (never against the real API):
//        API_URL=http://127.0.0.1:8000 npm run build && API_URL=http://127.0.0.1:8000 npm start
//   3. node scripts/screenshots.mjs "$(cat /tmp/tsinda-token)" [http://localhost:3000]
//
// Writes src/assets/screens/{ikibaho,ibisubizo,ikizamini}-{light,dark}.webp, and reports any page error or Content
// Security Policy violation seen on the way. Uses a local Chrome (CHROME_PATH to override); nothing to install.

import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const [token, base = "http://localhost:3000"] = process.argv.slice(2);
if (!token) {
  console.error('usage: node scripts/screenshots.mjs "<session token>" [site url]');
  process.exit(1);
}
const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9333;
const OUT = new URL("../src/assets/screens/", import.meta.url);
// An everyday Android phone: 390 × 844 CSS pixels, drawn at 2× for sharp text.
const PHONE = { width: 390, height: 844, deviceScaleFactor: 2, mobile: true };
const USER_AGENT =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36";
const THEMES = ["light", "dark"];

/** Calls the site's API as the demo learner. */
async function api(path, init = {}) {
  const response = await fetch(`${base}/api/v1${path}`, {
    ...init,
    headers: { Cookie: `gp_session=${token}`, Origin: base, "Content-Type": "application/json", ...init.headers },
  });
  if (!response.ok) throw new Error(`${init.method ?? "GET"} ${path}: ${response.status} ${await response.text()}`);
  return response.status === 204 ? null : response.json();
}

/** A minimal Chrome DevTools Protocol client for one tab. */
class Tab {
  constructor(socket) {
    this.socket = socket;
    this.nextId = 0;
    this.pending = new Map();
    this.listeners = new Set();
    socket.addEventListener("message", ({ data }) => {
      const message = JSON.parse(data);
      if (message.id) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(message.error.message));
        else resolve(message.result);
      } else {
        for (const listener of this.listeners) listener(message);
      }
    });
  }

  static async open() {
    const target = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: "PUT" })).json();
    const socket = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      socket.addEventListener("open", resolve, { once: true });
      socket.addEventListener("error", reject, { once: true });
    });
    return new Tab(socket);
  }

  send(method, params = {}) {
    const id = ++this.nextId;
    this.socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }

  next(method) {
    return new Promise((resolve) => {
      const listener = (message) => {
        if (message.method !== method) return;
        this.listeners.delete(listener);
        resolve(message.params);
      };
      this.listeners.add(listener);
    });
  }

  async goto(path) {
    const loaded = this.next("Page.loadEventFired");
    await this.send("Page.navigate", { url: `${base}${path}` });
    await loaded;
    await sleep(2500); // streamed sections, fonts and images
  }

  async shoot(name) {
    const { data } = await this.send("Page.captureScreenshot", { format: "webp", quality: 88 });
    await writeFile(new URL(`${name}.webp`, OUT), Buffer.from(data, "base64"));
    console.log(`  ${name}.webp`);
  }
}

async function startChrome(profile) {
  const chrome = spawn(
    CHROME,
    [
      "--headless=new",
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${profile}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--hide-scrollbars",
      "--disable-extensions",
      "about:blank",
    ],
    { stdio: "ignore" },
  );
  for (let i = 0; i < 50; i++) {
    try {
      await fetch(`http://127.0.0.1:${PORT}/json/version`);
      return chrome;
    } catch {
      await sleep(200);
    }
  }
  chrome.kill();
  throw new Error(`Chrome did not start (${CHROME})`);
}

const profile = await mkdtemp(join(tmpdir(), "tsinda-screens-"));
const chrome = await startChrome(profile);
const problems = [];
try {
  const me = await api("/auth/me");
  const badges = await api("/me/badges");
  const exams = await api("/exams");
  const lastExam = exams.find((e) => e.status === "completed");
  if (!lastExam) throw new Error("The demo learner has no finished exam: run scripts.demo_screens first.");

  const tab = await Tab.open();
  tab.listeners.add(({ method, params }) => {
    // Leaving a running exam asks "leave this page?", which headless Chrome declines and reports: expected here.
    const expected = method === "Log.entryAdded" && params.entry.text.includes("'beforeunload'");
    if (method === "Log.entryAdded" && params.entry.level === "error" && !expected) problems.push(params.entry.text);
    if (method === "Runtime.exceptionThrown") problems.push(params.exceptionDetails.exception?.description ?? "error");
  });
  await Promise.all(["Page.enable", "Network.enable", "Runtime.enable", "Log.enable"].map((m) => tab.send(m)));
  await tab.send("Network.setCookie", { name: "gp_session", value: token, url: base, httpOnly: true, path: "/" });
  await tab.send("Emulation.setDeviceMetricsOverride", PHONE);
  await tab.send("Emulation.setUserAgentOverride", { userAgent: USER_AGENT });

  let setup = null;
  async function theme(name) {
    if (setup) await tab.send("Page.removeScriptToEvaluateOnNewDocument", { identifier: setup });
    await tab.send("Emulation.setEmulatedMedia", {
      features: [
        { name: "prefers-color-scheme", value: name },
        { name: "prefers-reduced-motion", value: "reduce" },
      ],
    });
    // The chosen theme, badges already celebrated, the finished exam already cheered: no pop-ups in the picture.
    const seen = JSON.stringify(badges.items.filter((b) => b.earned).map((b) => b.id));
    ({ identifier: setup } = await tab.send("Page.addScriptToEvaluateOnNewDocument", {
      source: `try {
        localStorage.setItem("gp-theme", ${JSON.stringify(name)});
        localStorage.setItem(${JSON.stringify(`gp-badges-${me.id}`)}, ${JSON.stringify(seen)});
        sessionStorage.setItem(${JSON.stringify(`gp-celebrated-${lastExam.id}`)}, "1");
      } catch (e) {}`,
    }));
  }

  console.log("Writing src/assets/screens/:");
  // The dashboard first: once an exam is running, it shows a "finish your exam" banner.
  for (const name of THEMES) {
    await theme(name);
    await tab.goto("/ikibaho");
    await tab.shoot(`ikibaho-${name}`);
    await tab.goto(`/ikizamini/${lastExam.id}`);
    await tab.shoot(`ibisubizo-${name}`);
  }

  // A running exam on its first question with a picture, answer (b) chosen. The exam opens on the first unanswered
  // question, so everything up to the pictured one is answered and the page steps back to it.
  const exam = await api("/exams", { method: "POST" });
  const pictured = Math.max(0, exam.items.findIndex((item) => item.image));
  for (const [i, item] of exam.items.slice(0, pictured + 1).entries()) {
    const selected = i === pictured ? 1 : 0;
    await api(`/exams/${exam.id}/answers/${item.position}`, { method: "PUT", body: JSON.stringify({ selected }) });
  }
  for (const name of THEMES) {
    await theme(name);
    await tab.goto(`/ikizamini/${exam.id}`);
    await tab.send("Runtime.evaluate", {
      expression: 'window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }))',
    });
    await sleep(800);
    await tab.shoot(`ikizamini-${name}`);
  }
} finally {
  const exited = new Promise((resolve) => chrome.once("exit", resolve));
  chrome.kill();
  await exited;
  await rm(profile, { recursive: true, force: true, maxRetries: 3 });
}

if (problems.length) {
  console.log(`\nPage errors or blocked content (${problems.length}):`);
  for (const text of new Set(problems)) console.log(`  - ${text}`);
  process.exitCode = 1;
} else {
  console.log("\nNo page errors and nothing blocked by the Content Security Policy.");
}
