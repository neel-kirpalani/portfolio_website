// Verifies the row expand/collapse toggle with real key events.
// Usage: node test-rows.mjs [url]
import { spawn } from "node:child_process";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const url = process.argv[2] ?? "http://localhost:3000/";
// Pass "touch" as the second arg to launch Chrome reporting hover:none /
// pointer:coarse. Emulation.setEmulatedMedia cannot override these features;
// only the Blink settings below actually change what media queries match.
const touch = process.argv[3] === "touch";
const port = 9811 + Math.floor(Math.random() * 80);

const chromeArgs = [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--mute-audio",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=/tmp/nk-rows-${port}`,
  "--window-size=1440,900",
];
if (touch) {
  chromeArgs.push(
    "--blink-settings=primaryHoverType=1,availableHoverTypes=1,primaryPointerType=2,availablePointerTypes=2",
  );
}
chromeArgs.push(url);

const chrome = spawn(CHROME, chromeArgs, { stdio: "ignore" });

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

let failures = 0;
const check = (label, actual, expected) => {
  const ok = actual === expected;
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}  (got ${actual}, want ${expected})`);
};

try {
  const t = await target();
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  const { ready, send } = cdp(ws);
  await ready;
  await send("Page.enable");
  await sleep(3500);

  const evalJs = async (expression) =>
    (await send("Runtime.evaluate", { expression, returnByValue: true })).result.value;

  const expanded = () =>
    evalJs(`document.querySelector('#projects button[aria-expanded]').getAttribute('aria-expanded')`);

  const panelHeight = () =>
    evalJs(`(() => {
      const b = document.querySelector('#projects button[aria-expanded]');
      const p = document.getElementById(b.getAttribute('aria-controls'));
      return Math.round(p.getBoundingClientRect().height);
    })()`);

  // Enter needs a full "keyDown" carrying text, otherwise Chrome never runs the
  // button's default activation. Space activates on keyup, so rawKeyDown is
  // enough there.
  const press = async (key, code, vk) => {
    await send("Input.dispatchKeyEvent", {
      type: "keyDown",
      key, code,
      text: key === "Enter" ? "\r" : key === " " ? " " : undefined,
      windowsVirtualKeyCode: vk,
      nativeVirtualKeyCode: vk,
    });
    await send("Input.dispatchKeyEvent", {
      type: "keyUp",
      key, code,
      windowsVirtualKeyCode: vk,
      nativeVirtualKeyCode: vk,
    });
    await sleep(500);
  };

  // The whole point: rows must be reachable and operable without a mouse.
  const focusable = await evalJs(
    `document.querySelectorAll('#projects button[aria-expanded]').length`,
  );
  check("every project row is a real button", focusable, 6);

  await evalJs(`document.querySelector('#projects button[aria-expanded]').focus()`);
  check("starts collapsed", await expanded(), "false");
  check("panel starts at zero height", await panelHeight(), 0);

  await press("Enter", "Enter", 13);
  check("Enter expands", await expanded(), "true");
  check("panel has real height after expanding", (await panelHeight()) > 100, true);

  await press(" ", "Space", 32);
  check("Space collapses", await expanded(), "false");

  // Education has no detail, so it must not be a toggle at all.
  const educationButtons = await evalJs(
    `document.querySelectorAll('#education button').length`,
  );
  check("rows with nothing to show are not buttons", educationButtons, 0);

  // Press feedback must land on pointer-down, not on release.
  const rowTransform = () =>
    evalJs(
      `getComputedStyle(document.querySelector('#projects button[aria-expanded]')).transform`,
    );
  const point = JSON.parse(
    await evalJs(`(() => {
      const r = document.querySelector('#projects button[aria-expanded]').getBoundingClientRect();
      return JSON.stringify({ x: r.left + 40, y: r.top + r.height / 2 });
    })()`),
  );

  check("row is at rest before pressing", await rowTransform(), "none");

  await send("Input.dispatchMouseEvent", {
    type: "mousePressed", x: point.x, y: point.y, button: "left", clickCount: 1,
  });
  await sleep(300);
  const held = await rowTransform();
  check("pointer-down scales the row", held !== "none", true);

  await send("Input.dispatchMouseEvent", {
    type: "mouseReleased", x: point.x, y: point.y, button: "left", clickCount: 1,
  });
  await sleep(600);
  check("row returns to rest on release", await rowTransform(), "none");

  // On a touch device the browser fakes a hover on first tap and leaves it
  // there. Only meaningful when Chrome was launched reporting hover:none.
  if (touch) {
    console.log(
      "        media:",
      await evalJs(`JSON.stringify({
        hoverHover: matchMedia('(hover: hover)').matches,
        pointerFine: matchMedia('(pointer: fine)').matches,
      })`),
    );

    const rowBg = () =>
      evalJs(
        `getComputedStyle(document.querySelector('#projects button[aria-expanded]')).backgroundColor`,
      );
    check("no hover background at rest on touch", await rowBg(), "rgba(0, 0, 0, 0)");

    for (const type of ["mousePressed", "mouseReleased"]) {
      await send("Input.dispatchMouseEvent", {
        type, x: point.x, y: point.y, button: "left", clickCount: 1,
      });
    }
    await sleep(700);
    check("no hover background stuck after a tap", await rowBg(), "rgba(0, 0, 0, 0)");
  } else {
    console.log("SKIP  stuck-hover check; rerun with the `touch` argument");
  }

  console.log(
    failures === 0
      ? "\nAll row interaction checks passed."
      : `\n${failures} check(s) FAILED.`,
  );
} catch (e) {
  console.log("ERROR", e.message);
  failures++;
} finally {
  chrome.kill("SIGKILL");
  process.exit(failures === 0 ? 0 : 1);
}
