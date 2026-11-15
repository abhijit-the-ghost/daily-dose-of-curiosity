#!/usr/bin/env bun
/**
 * dev_shot.mjs — developer tool: grab stage screenshots at specific times.
 *
 *   bun scripts/dev_shot.mjs 0.5,10,30,50,59.4                (default episode = milkyway)
 *   bun scripts/dev_shot.mjs 0.5,10,30,50,59.4 --episode url-explainer
 *   bun scripts/dev_shot.mjs 0,2,6,18,30 --episode space-sound
 *
 * Spawns vite, seeks the stage to each requested time via window.__seek(),
 * and saves PNGs to <tmp>/internet-shorts-shots/.
 * No arguments → default timeline sample points.
 */
import { spawn } from 'node:child_process';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import puppeteer from 'puppeteer';

const getFreePort = () =>
  new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.once('error', reject);
    srv.listen(0, () => {
      const port = srv.address().port;
      srv.close(() => resolve(port));
    });
  });

const argv = process.argv.slice(2);
const episodeFlagIndex = argv.indexOf('--episode');
const EPISODE = episodeFlagIndex >= 0 ? argv[episodeFlagIndex + 1] : null;
const URL_SUFFIX = `?record=1${EPISODE ? `&episode=${EPISODE}` : ''}`;
const PORT = await getFreePort();
const OUT_DIR = path.join(os.tmpdir(), 'internet-shorts-shots');
const URL_RECORD = `http://127.0.0.1:${PORT}/episode${URL_SUFFIX}`;

// positional args are the time list; named args start with '--'
const timeArg = argv.find((a) => !a.startsWith('--')) ?? '0.5,10,25,45,59';
const samples = timeArg
  .split(/[,\s]+/)
  .map((s) => Number(s.trim()))
  .filter((n) => Number.isFinite(n));

const args = ['node_modules/vite/bin/vite.js', '--port', String(PORT), '--strictPort', '--host', '127.0.0.1'];
const server = spawn(process.execPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
server.stdout.on('data', (d) => process.stderr.write(`[vite] ${d}`));
server.stderr.on('data', (d) => process.stderr.write(d));
server.on('exit', (code) => {
  if (code !== null && code !== 0) console.error(`[shot] vite dev server exited early with code ${code}`);
});

const waitForServer = async () => {
  const deadline = Date.now() + 75_000;
  while (Date.now() < deadline) {
    const ok = await new Promise((resolve) => {
      const sock = net.createConnection({ host: '127.0.0.1', port: PORT }, () => {
        sock.end();
        resolve(true);
      });
      sock.on('error', () => resolve(false));
      sock.setTimeout(600, () => { sock.destroy(); resolve(false); });
    });
    if (ok) return;
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error('vite dev server did not start within 75s');
};

try {
  await waitForServer();
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', `--window-size=1080,1920`],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  await page.goto(URL_RECORD, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForFunction('window.__ready === true', { timeout: 30_000 });

  for (const t of samples) {
    await page.evaluate((tt) => window.__seek?.(tt), t);
    await page.evaluate(
      () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
    );
    const file = path.join(OUT_DIR, `t_${String(t).replace('.', '_')}.png`);
    await page.screenshot({ path: file, type: 'png' });
    console.log('[shot]', file);
  }

  await browser.close();
} finally {
  server.kill();
}
