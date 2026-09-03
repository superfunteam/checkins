// Minimal Chrome DevTools Protocol driver (no deps; Node 22 global WebSocket).
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';

const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9333;

export async function launch({ profile, width = 390, height = 844 }) {
  mkdirSync(profile, { recursive: true });
  const proc = spawn(CHROME, [
    '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
    `--window-size=${width},${height}`, '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
    '--disable-gpu', 'about:blank',
  ], { stdio: 'ignore' });
  let targets;
  for (let i = 0; i < 50; i++) {
    try { targets = await (await fetch(`http://localhost:${PORT}/json`)).json(); break; } catch { await sleep(200); }
  }
  if (!targets) throw new Error('chrome did not start');
  const page = await connect(targets.find((t) => t.type === 'page'));
  page.kill = () => proc.kill();
  return page;
}

async function connect(target) {
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0; const pending = new Map(); const listeners = [];
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) { const { res, rej } = pending.get(msg.id); pending.delete(msg.id); msg.error ? rej(new Error(msg.error.message)) : res(msg.result); }
    else if (msg.method) listeners.forEach((l) => l(msg));
  };
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
  const on = (method, fn) => listeners.push((m) => m.method === method && fn(m.params));
  await send('Page.enable'); await send('Runtime.enable');
  const logs = [];
  on('Runtime.consoleAPICalled', (p) => logs.push(`[${p.type}] ${p.args.map((a) => a.value ?? a.description ?? '').join(' ')}`));
  on('Runtime.exceptionThrown', (p) => logs.push(`[exception] ${p.exceptionDetails.text} ${p.exceptionDetails.exception?.description || ''}`));
  const page = {
    logs, send,
    async goto(url) {
      const loaded = new Promise((r) => on('Page.loadEventFired', r));
      await send('Page.navigate', { url }); await loaded; await sleep(300);
    },
    async eval(expr) {
      const r = await send('Runtime.evaluate', { expression: `(async()=>{${expr}})()`, awaitPromise: true, returnByValue: true });
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
      return r.result.value;
    },
    async screenshot(path) {
      const { data } = await send('Page.captureScreenshot', { format: 'png' });
      writeFileSync(path, Buffer.from(data, 'base64'));
    },
    async clickText(text) {
      return page.eval(`const b=[...document.querySelectorAll('button')].find(b=>b.textContent.trim().includes(${JSON.stringify(text)})); if(!b) return false; b.click(); return true;`);
    },
    async waitForText(text, ms = 15000) {
      const t0 = Date.now();
      while (Date.now() - t0 < ms) { if (await page.eval(`return document.body.innerText.includes(${JSON.stringify(text)})`)) return true; await sleep(250); }
      return false;
    },
    close: () => ws.close(),
  };
  return page;
}
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
