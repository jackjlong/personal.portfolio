// npm run shots [name ...]: screenshots of every prototype with expectReady true in e2e/prototypes.json
import { mkdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';
import { prototypes, projects, hooksFor, locate, reveal, tabTo } from '../e2e/hooks.js';

const viewport = { width: 1440, height: 900 };
const only = process.argv.slice(2);
const ready = prototypes.filter((p) => p.expectReady && (!only.length || only.includes(p.name)));
if (!ready.length) {
  console.log('no prototypes have expectReady: true yet, nothing to shoot');
  process.exit(0);
}

const port = 5175;
const base = `http://localhost:${port}`;
const server = spawn('npx', ['http-server', '.', '-p', String(port), '-c-1', '-s'], { stdio: 'ignore' });
for (let i = 0; ; i++) {
  try { await fetch(base); break; } catch { if (i > 50) throw new Error('static server never started'); }
  await new Promise((r) => setTimeout(r, 200));
}

const browser = await chromium.launch({ channel: 'chrome' });
let failed = 0;

async function shot(page, dir, file, step) {
  try {
    await step?.();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${dir}/${file}.png` });
    console.log(`  ok ${file}`);
  } catch (e) {
    failed++;
    console.log(`  skipped ${file}: ${e.message.split('\n')[0]}`);
  }
}

for (const proto of ready) {
  const hooks = hooksFor(proto);
  const dir = `shots/${proto.name}`;
  mkdirSync(dir, { recursive: true });
  console.log(proto.name);
  const go = (page, suffix = '') => page.goto(base + proto.path + suffix, { waitUntil: 'networkidle' });

  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  await go(page);
  await shot(page, dir, '01-first-view');
  await shot(page, dir, '02-focus', async () => {
    await reveal(page, hooks);
    if (!(await tabTo(page, locate(page, hooks.openProject(projects[0])))))
      throw new Error('tab never reached the first project');
  });
  await shot(page, dir, '03-project-open', () => go(page, `#work/${projects[0].id}`));
  await shot(page, dir, '04-now', () => go(page, '#now'));
  await shot(page, dir, '05-about', () => go(page, '#about'));
  await shot(page, dir, '06-contact', () => go(page, '#contact'));
  await ctx.close();

  const rctx = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  const rpage = await rctx.newPage();
  await go(rpage);
  await shot(rpage, dir, '07-reduced-motion');
  await rctx.close();
}

await browser.close();
server.kill();
console.log(failed ? `done, ${failed} shots skipped` : 'done');
process.exit(failed ? 1 : 0);
