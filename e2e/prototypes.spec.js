import { test, expect } from '@playwright/test';
import {
  prototypes, projects, SECTIONS, hooksFor, locate, reveal, tabTo, runningAnimations,
} from './hooks.js';

for (const proto of prototypes) {
  const hooks = hooksFor(proto);
  const url = (suffix = '') => proto.path + suffix;

  test.describe(`prototype ${proto.name}`, () => {
    // nothing runs until expectReady is true in e2e/prototypes.json, then every check is strict
    test.skip(!proto.expectReady, 'not ready yet, flip expectReady in e2e/prototypes.json');

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
