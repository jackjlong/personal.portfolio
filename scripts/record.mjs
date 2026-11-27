// npm run record [name ...]: a short webm walkthrough of every ready prototype in e2e/prototypes.json
// saves shots/<name>/walkthrough.webm and shots/<name>/02b-hover.png
import { mkdirSync, renameSync, rmSync } from 'node:fs';
import { chromium } from '@playwright/test';
import { startServer } from './serve.mjs';
import { prototypes, projects, hooksFor, locate, reveal, tabTo } from '../e2e/hooks.js';

const viewport = { width: 1440, height: 900 };
const only = process.argv.slice(2);
const ready = prototypes.filter((p) => p.expectReady && (!only.length || only.includes(p.name)));
if (!ready.length) {
  console.log('no prototypes have expectReady: true yet, nothing to record');
  process.exit(0);
}

const { base, stop } = await startServer();

const browser = await chromium.launch({ channel: 'chrome' });
const pause = (page, ms = 1200) => page.waitForTimeout(ms);
let failed = 0;

async function step(name, fn) {
  try {
    await fn();
    console.log(`  ok ${name}`);
  } catch (e) {
    failed++;
    console.log(`  skipped ${name}: ${e.message.split('\n')[0]}`);
  }
}

for (const proto of ready) {
  const hooks = hooksFor(proto);
  const dir = `shots/${proto.name}`;
  const tmp = `${dir}/.video`;
  mkdirSync(tmp, { recursive: true });
  console.log(proto.name);
  const url = (suffix = '') => base + proto.path + suffix;

  const ctx = await browser.newContext({ viewport, recordVideo: { dir: tmp, size: viewport } });
  const page = await ctx.newPage();
  await page.goto(url(), { waitUntil: 'networkidle' });
  await pause(page, 1800);

  await step('hover', async () => {
    await reveal(page, hooks);
    await locate(page, hooks.openProject(projects[0])).hover();
    await pause(page, 900);
    await page.screenshot({ path: `${dir}/02b-hover.png` });
    await pause(page);
    await page.mouse.move(5, 5);
  });
  await step('keyboard focus', async () => {
    await page.goto(url(), { waitUntil: 'networkidle' });
    await reveal(page, hooks);
    if (!(await tabTo(page, locate(page, hooks.openProject(projects[0])))))
      throw new Error('tab never reached the first project');
    await pause(page);
  });
  for (const p of projects) {
    await step(`open ${p.name}`, async () => {
      await page.goto(url(), { waitUntil: 'networkidle' });
      await reveal(page, hooks);
      await locate(page, hooks.openProject(p)).click();
      await pause(page, 2000);
    });
  }
  for (const section of ['now', 'about', 'contact']) {
    await step(section, async () => {
      await page.goto(url(), { waitUntil: 'networkidle' });
      await locate(page, hooks.nav(section)).click();
      await pause(page, 1500);
    });
  }

  const video = page.video();
  await ctx.close();
  renameSync(await video.path(), `${dir}/walkthrough.webm`);
  rmSync(tmp, { recursive: true, force: true });
  console.log(`  saved ${dir}/walkthrough.webm`);
}

await browser.close();
stop();
console.log(failed ? `done, ${failed} steps skipped` : 'done');
process.exit(failed ? 1 : 0);
