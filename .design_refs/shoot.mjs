// Reusable headless-Chrome screenshot harness over raw CDP.
// Usage: node shoot.mjs <name> <url> [waitMs] [width] [height] [viewport|full]
// Node 22 ships a global WebSocket, so no puppeteer/playwright needed.
import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const [
  name,
  url,
  waitMs = "6000",
  width = "1440",
  height = "900",
  mode = "viewport",
  scrollY = "",
  hover = "",
  click = "",
] = process.argv.slice(2);

const W = Number(width);
const H = Number(height);
const OUT = resolve(import.meta.dirname, "shots");
mkdirSync(OUT, { recursive: true });

const port = 9300 + Math.floor(Math.random() * 500);
const profile = resolve(import.meta.dirname, "profiles", `${name}-${port}`);

const chrome = spawn(CHROME, [
  "--headless=new",
  "--no-sandbox",
  "--disable-gpu",
  "--hide-scrollbars",
  "--mute-audio",
  "--disable-dev-shm-usage",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`,
  `--window-size=${W},${H}`,
  url,
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function target() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      const list = await res.json();
      const page = list.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
      if (page) return page;
    } catch {}
    await sleep(500);
  }
  throw new Error("no page target");
}

function cdp(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let id = 0;
  const pending = new Map();
  const ready = new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = rej;
  });
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve: rs, reject: rj } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? rj(new Error(JSON.stringify(msg.error))) : rs(msg.result);
    }
  };
  const send = (method, params = {}) =>
    new Promise((rs, rj) => {
      const myId = ++id;
      pending.set(myId, { resolve: rs, reject: rj });
      ws.send(JSON.stringify({ id: myId, method, params }));
    });
  return { ready, send, close: () => ws.close() };
}

try {
  const t = await target();
  const { ready, send, close } = cdp(t.webSocketDebuggerUrl);
  await ready;
  await send("Page.enable");

  // Real device emulation. Chrome enforces a minimum window width on macOS,
  // so --window-size alone cannot produce a true 390px phone viewport.
  await send("Emulation.setDeviceMetricsOverride", {
    width: W,
    height: H,
    deviceScaleFactor: 1,
    mobile: W < 700,
  });

  // "reduce" in the mode forces prefers-reduced-motion, which makes the
  // Reveal wrappers render plainly, so a full-page capture shows real layout
  // instead of content still waiting to scroll into view.
  if (mode.includes("reduce")) {
    await send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value: "reduce" }],
    });
  }

  // Real wall-clock settle: SPAs, intros and WebGL need actual time.
  await sleep(Number(waitMs));

  // Optional: scroll to a y offset so a section can be inspected at full
  // resolution instead of squinting at a heavily downscaled full-page image.
  if (scrollY !== "") {
    const target = /^-?\d+$/.test(scrollY)
      ? `window.scrollTo(0, ${Number(scrollY)})`
      : `document.querySelector(${JSON.stringify(scrollY)})?.scrollIntoView({block:'start'})`;
    await send("Runtime.evaluate", { expression: target });
    await sleep(1200);
  }

  // Optional: drive a real pointer over an element so hover states can be
  // verified rather than assumed.
  if (hover !== "") {
    const box = await send("Runtime.evaluate", {
      expression: `(() => {
        const el = document.querySelector(${JSON.stringify(hover)});
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return JSON.stringify({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
      })()`,
      returnByValue: true,
    });
    if (box.result.value) {
      const { x, y } = JSON.parse(box.result.value);
      await send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
      await sleep(1000);
    } else {
      console.log(`${name}\tWARN\tno element matched hover selector ${hover}`);
    }
  }

  // Optional: click an element, so toggle states can be verified.
  if (click !== "") {
    const box = await send("Runtime.evaluate", {
      expression: `(() => {
        const el = document.querySelector(${JSON.stringify(click)});
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return JSON.stringify({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
      })()`,
      returnByValue: true,
    });
    if (box.result.value) {
      const { x, y } = JSON.parse(box.result.value);
      for (const type of ["mousePressed", "mouseReleased"]) {
        await send("Input.dispatchMouseEvent", {
          type, x, y, button: "left", clickCount: 1,
        });
      }
      await sleep(1000);
    } else {
      console.log(`${name}\tWARN\tno element matched click selector ${click}`);
    }
  }

  const params = { format: "png" };
  if (mode.includes("full") && scrollY === "") {
    const metrics = await send("Page.getLayoutMetrics");
    const size = metrics.cssContentSize ?? metrics.contentSize;
    params.captureBeyondViewport = true;
    params.clip = {
      x: 0,
      y: 0,
      width: size.width,
      height: Math.min(size.height, 5200),
      scale: 1,
    };
  }

  const shot = await send("Page.captureScreenshot", params);
  const path = resolve(OUT, `${name}.png`);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, Buffer.from(shot.data, "base64"));

  const meta = await send("Runtime.evaluate", {
    expression: `JSON.stringify({
      title: document.title,
      body: getComputedStyle(document.body).backgroundColor,
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
      overflowers: [...document.querySelectorAll('body *')]
        .filter(e => e.getBoundingClientRect().right > document.documentElement.clientWidth + 1)
        .slice(0, 8)
        .map(e => e.tagName + '.' + (e.className || '').toString().slice(0, 60)),
      h1: (() => {
        const e = document.querySelector('h1');
        if (!e) return null;
        const r = e.getBoundingClientRect();
        const cs = getComputedStyle(e);
        return { fs: cs.fontSize, sw: e.scrollWidth, cw: e.clientWidth, text: e.innerText.replace(/\\n/g, ' '), top: Math.round(r.top), h: Math.round(r.height), opacity: cs.opacity, visibility: cs.visibility };
      })(),
      docHeight: document.documentElement.scrollHeight,
      truncated: [...document.querySelectorAll('.row-title')]
        .filter(e => e.scrollWidth > e.clientWidth + 1)
        .map(e => e.innerText.trim().slice(0, 34)),
      panes: [...document.querySelectorAll('.scroll-pane')].map(e => ({
        sh: e.scrollHeight, ch: e.clientHeight,
        overflows: e.scrollHeight > e.clientHeight + 1,
        side: e.dataset.pane ?? '?',
      })),
      expanded: [...document.querySelectorAll('[aria-expanded]')].map(b => ({
        label: b.innerText.trim().split('\\n')[0].slice(0, 40),
        open: b.getAttribute('aria-expanded'),
      })),
      sections: [...document.querySelectorAll('section')].map(s => ({
        id: s.id || '(none)',
        top: Math.round(s.getBoundingClientRect().top + window.scrollY),
        h: Math.round(s.getBoundingClientRect().height),
      })),
    })`,
    returnByValue: true,
  });
  console.log(`${name}\tOK\t${path}\t${meta.result.value}`);
  close();
} catch (e) {
  console.log(`${name}\tFAIL\t${e.message}`);
} finally {
  chrome.kill("SIGKILL");
  process.exit(0);
}
