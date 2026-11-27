import { test, expect } from '@playwright/test';
import {
  site, projects, SECTIONS, hooksFor, locate, reveal, tabTo, runningAnimations,
} from './hooks.js';

const proto = site;
{
  const hooks = hooksFor(proto);
  const url = (suffix = '') => proto.path + suffix;

  test.describe(`site (${proto.name})`, () => {
    let errors;
    test.beforeEach(({ page }) => {
      errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
    });
    test.afterEach(() => expect(errors, 'page errors').toEqual([]));

    test('loads with no page errors', async ({ page }) => {
      const res = await page.goto(url());
      expect(res?.ok()).toBe(true);
      await page.waitForLoadState('networkidle');
    });

    test('both projects visible within 2 interactions', async ({ page }) => {
      await page.goto(url());
      await reveal(page, hooks);
      for (const p of projects) await expect(page.getByText(p.name).first()).toBeVisible();
    });

    for (const p of projects) {
      test(`${p.name} opens by keyboard and shows live and source links`, async ({ page }) => {
        await page.goto(url());
        await reveal(page, hooks);
        const control = locate(page, hooks.openProject(p));
        expect(await tabTo(page, control), `tab never reached ${p.name}`).toBe(true);
        await page.keyboard.press('Enter');
        await expect(page).toHaveURL(new RegExp(`#work/${p.id}$`));
        await expect(page.locator(`a[href="${p.live}"]`).first()).toBeVisible();
        await expect(page.locator(`a[href="${p.source}"]`).first()).toBeVisible();
      });

      test(`#work/${p.id} opens ${p.name} directly`, async ({ page }) => {
        await page.goto(url(`#work/${p.id}`));
        await expect(page.locator(`a[href="${p.live}"]`).first()).toBeVisible();
        await expect(page.locator(`a[href="${p.source}"]`).first()).toBeVisible();
      });
    }

    for (const section of SECTIONS) {
      test(`${section} reachable from the nav by keyboard`, async ({ page }) => {
        await page.goto(url());
        const control = locate(page, hooks.nav(section));
        expect(await tabTo(page, control), `tab never reached ${section}`).toBe(true);
        await page.keyboard.press('Enter');
        await expect(page).toHaveURL(new RegExp(`#${section}(/|$)`));
        await expect(hooks.shown(page, section)).toBeVisible();
      });

      test(`#${section} shows ${section} directly`, async ({ page }) => {
        await page.goto(url(`#${section}`));
        await expect(hooks.shown(page, section)).toBeVisible();
      });
    }

    for (const size of [{ width: 1440, height: 900 }, { width: 1280, height: 800 }]) {
      test(`no sideways scroll at ${size.width} on the map, a project, and each section`, async ({ page }) => {
        await page.setViewportSize(size);
        const states = ['', ...projects.map((p) => `#work/${p.id}`), ...SECTIONS.map((s) => `#${s}`)];
        for (const hash of states) {
          await page.goto(url(hash));
          await page.waitForTimeout(400);
          const { sw, vw } = await page.evaluate(() => ({
            sw: document.documentElement.scrollWidth,
            vw: document.documentElement.clientWidth,
          }));
          expect(sw, `sideways scroll at ${hash || 'home'}`).toBeLessThanOrEqual(vw);
        }
      });
    }

    for (const p of projects) {
      test(`${p.name} picture loads when it's open`, async ({ page }) => {
        await page.goto(url(`#work/${p.id}`));
        const poster = page.locator('img.poster').first();
        await expect(poster).toBeVisible();
        await expect.poll(() => poster.evaluate((img) => img.complete && img.naturalWidth)).toBeGreaterThan(0);
      });
    }

    test('no running animations with reduced motion', async ({ browser }) => {
      const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
      const page = await ctx.newPage();
      page.on('pageerror', (e) => errors.push(e.message));
      expect((await page.goto(url()))?.ok()).toBe(true);
      await page.waitForTimeout(1000);
      expect(await runningAnimations(page)).toBe(0);
      await ctx.close();
    });

    test('no running animations with ?motion=off', async ({ page }) => {
      expect((await page.goto(url('?motion=off')))?.ok()).toBe(true);
      await page.waitForTimeout(1000);
      expect(await runningAnimations(page)).toBe(0);
    });
  });
}
