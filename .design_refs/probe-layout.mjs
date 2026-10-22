// Probe the reference site's page structure: what actually scrolls, and the
// vertical rhythm of its lists. Read-only.
import { spawn } from "node:child_process";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const url = process.argv[2] ?? "https://rexanwong.com/";
const port = 9700 + Math.floor(Math.random() * 90);

const chrome = spawn(CHROME, [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--mute-audio",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=/tmp/nk-layout-${port}`,
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
  const out = {};
  const R = (e) => { const r = e.getBoundingClientRect(); return { top: Math.round(r.top), h: Math.round(r.height) }; };
  out.viewport = {
    innerHeight: window.innerHeight,
    docScrollHeight: document.documentElement.scrollHeight,
    bodyScrollHeight: document.body.scrollHeight,
    docOverflowY: getComputedStyle(document.documentElement).overflowY,
    bodyOverflowY: getComputedStyle(document.body).overflowY,
  };

  out.scrollers = [...document.querySelectorAll("*")]
    .filter((e) => e.scrollHeight > e.clientHeight + 8)
    .slice(0, 6)
    .map((e) => {
      const cs = getComputedStyle(e);
      return { tag: e.tagName, cls: String(e.className || "").slice(0, 70),
        overflowY: cs.overflowY, height: cs.height, scrollH: e.scrollHeight, clientH: e.clientHeight };
    });

  out.rhythm = [...document.querySelectorAll("h2, h3")].slice(0, 6).map((h) => {
    const sec = h.closest("section") || h.parentElement?.parentElement;
    const rows = sec ? [...sec.querySelectorAll("a")].slice(0, 12) : [];
    return {
      title: h.innerText.trim().slice(0, 30),
      head: R(h),
      sec: sec ? R(sec) : null,
      firstRow: rows[0] ? R(rows[0]) : null,
      lastRow: rows.length ? R(rows[rows.length - 1]) : null,
      rowCount: rows.length,
    };
  });

  const head = document.querySelector("h2, h3");
  const sec = head?.closest("section") || head?.parentElement?.parentElement;
  const list = sec?.querySelector("ul, ol, div");
  if (list) {
    const cs = getComputedStyle(list);
    out.list = { tag: list.tagName, display: cs.display, gap: cs.gap, padding: cs.padding,
      marginTop: cs.marginTop, borderTop: cs.borderTopWidth, children: list.children.length };
    const kid = list.children[0];
    if (kid) {
      const kcs = getComputedStyle(kid);
      const inner = kid.querySelector("a") || kid;
      const ics = getComputedStyle(inner);
      out.row = { tag: kid.tagName, h: Math.round(kid.getBoundingClientRect().height),
        padding: kcs.padding, margin: kcs.margin, borderBottom: kcs.borderBottomWidth,
        gap: kcs.gap, display: kcs.display };
      out.rowInner = { tag: inner.tagName, h: Math.round(inner.getBoundingClientRect().height),
        padding: ics.padding, margin: ics.margin, borderBottom: ics.borderBottomWidth,
        display: ics.display, gap: ics.gap };
      out.rowHtml = kid.outerHTML.slice(0, 600);
    }
  }
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
