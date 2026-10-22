// Dumps the x/y position of the profile column's pieces and the first list
// heading, so vertical offset and text indent can be compared between sites.
import { spawn } from "node:child_process";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const url = process.argv[2] ?? "https://rexanwong.com/";
const port = 9700 + Math.floor(Math.random() * 90);

const chrome = spawn(CHROME, [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--mute-audio",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=/tmp/nk-indent-${port}`,
  "--window-size=1440,900",
  url,
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function target() {
  for (let i = 0; i < 60; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      const p = list.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
      if (p) return p;
    } catch {}
    await sleep(500);
  }
  throw new Error("no target");
}

function cdp(ws) {
  let id = 0;
  const pending = new Map();
  const ready = new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) {
      const { resolve, reject } = pending.get(m.id);
      pending.delete(m.id);
      m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result);
    }
  };
  return {
    ready,
    send: (method, params = {}) =>
      new Promise((resolve, reject) => {
        const myId = ++id;
        pending.set(myId, { resolve, reject });
        ws.send(JSON.stringify({ id: myId, method, params }));
      }),
  };
}

const EXPR = `(() => {
  const R = (e) => {
    if (!e) return null;
    const r = e.getBoundingClientRect();
    return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) };
  };
  const out = {};
  out.h1 = R(document.querySelector("h1"));
  out.main = R(document.querySelector("main"));
  out.firstSection = R(document.querySelector("h2"));
  out.sections = [...document.querySelectorAll("h2")].slice(0, 5).map((h) => ({
    t: h.innerText.trim().slice(0, 18), ...R(h),
  }));

  const leaves = [...document.querySelectorAll("p, span, div, a")]
    .filter((e) => e.children.length === 0 && (e.innerText || "").trim());

  const loc = leaves.find((e) => /San Francisco|Hong Kong/i.test(e.innerText) && e.innerText.length < 40);
  out.location = R(loc);

  out.avatar = R(document.querySelector("main img"));

  out.bio = [...document.querySelectorAll("p")]
    .filter((p) => (p.innerText || "").trim().length > 40)
    .slice(0, 6)
    .map((p) => ({ text: p.innerText.trim().slice(0, 26), ...R(p) }));

  const fm = leaves.find((e) => /^find me$/i.test(e.innerText.trim()));
  out.findMeLabel = R(fm);
  if (fm && fm.parentElement) out.findMeBox = R(fm.parentElement);

  // Everything sitting in the left gutter, to reveal what creates the indent.
  out.leftRegion = [...document.querySelectorAll("main *")]
    .filter((e) => {
      const r = e.getBoundingClientRect();
      return r.left < 720 && r.top > 140 && r.top < 720 && r.width > 4 && r.height > 4 && r.width < 720;
    })
    .slice(0, 22)
    .map((e) => ({
      tag: e.tagName,
      cls: String(e.className || "").slice(0, 42),
      ...R(e),
      txt: (e.innerText || "").trim().slice(0, 18),
    }));

  return JSON.stringify(out, null, 1);
})()`;

try {
  const t = await target();
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  const { ready, send } = cdp(ws);
  await ready;
  await send("Page.enable");
  await sleep(6000);
  const res = await send("Runtime.evaluate", { expression: EXPR, returnByValue: true });
  console.log(url);
  console.log(res.result.value);
} catch (e) {
  console.log("ERROR", e.message);
} finally {
  chrome.kill("SIGKILL");
  process.exit(0);
}
