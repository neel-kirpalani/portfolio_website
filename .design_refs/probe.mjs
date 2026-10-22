// One-off probe: dumps computed styles from a live URL so "match this site"
// becomes numbers instead of impressions.
import { spawn } from "node:child_process";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const url = process.argv[2] ?? "https://rexanwong.com/";
const port = 9700 + Math.floor(Math.random() * 90);

const chrome = spawn(CHROME, [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--mute-audio",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=/tmp/nk-probe-${port}`,
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
  const PICK = ["display","fontSize","fontFamily","fontWeight","lineHeight",
    "letterSpacing","color","backgroundColor","borderRadius","padding",
    "marginTop","marginBottom","gap","border","width","height","boxShadow",
    "textDecorationLine","opacity"];
  const pick = (el) => {
    const cs = getComputedStyle(el);
    const o = {};
    for (const k of PICK) o[k] = cs[k];
    o._text = (el.innerText || "").trim().slice(0, 40);
    return o;
  };
  const out = {};

  out.headings = [...document.querySelectorAll("h1,h2,h3,h4")].slice(0, 12).map((e) => ({
    tag: e.tagName, ...pick(e),
  }));

  // The "Find me" block.
  const label = [...document.querySelectorAll("*")].find(
    (e) => e.children.length === 0 && /^find me$/i.test((e.innerText || "").trim())
  );
  if (label) {
    const box = label.parentElement;
    out.findMe = {
      label: pick(label),
      container: pick(box),
      html: box.outerHTML.slice(0, 1400),
      links: [...box.querySelectorAll("a")].map((a) => ({
        ...pick(a),
        html: a.outerHTML.slice(0, 320),
        svg: a.querySelector("svg") ? getComputedStyle(a.querySelector("svg")).width : null,
      })),
    };
  }

  // A sample of list rows in the right column.
  const rows = [...document.querySelectorAll("a")].filter(
    (a) => a.innerText && a.innerText.trim().length > 3 && a.closest("ul,ol,div")
  );
  out.sampleRows = rows.slice(0, 10).map((a) => ({ tag: a.tagName, ...pick(a) }));

  out.body = pick(document.body);
  out.docHeight = document.documentElement.scrollHeight;
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
  console.log(res.result.value);
} catch (e) {
  console.log("ERROR", e.message);
} finally {
  chrome.kill("SIGKILL");
  process.exit(0);
}
