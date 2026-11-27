// shared by the tests and the screenshot script. hooks come from e2e/prototypes.json.
import { readFileSync } from 'node:fs';
import { projects, contact, sections } from '../shared/content.js';

export const { prototypes } = JSON.parse(
  readFileSync(new URL('./prototypes.json', import.meta.url), 'utf8')
);
export { projects };

export const SECTIONS = ['work', 'now', 'about', 'contact'];
const DEFAULT_NAV = { work: 'Work', now: 'Now', about: 'About', contact: 'Contact' };
const ANY_ROLE = ['link', 'button', 'tab', 'menuitem'];

// a target is { role?, name, exact? } or { css }. no role = any of link, button, tab, menuitem.
// names match as a case-insensitive substring unless exact is true.
export function locate(page, target) {
  if (target.css) return page.locator(target.css).first();
  const opts = { name: target.name, exact: target.exact ?? false };
  if (target.role) return page.getByRole(target.role, opts).first();
  let loc = page.getByRole(ANY_ROLE[0], opts);
  for (const r of ANY_ROLE.slice(1)) loc = loc.or(page.getByRole(r, opts));
  return loc.first();
}

const asTarget = (v) => (typeof v === 'string' ? { name: v } : v);
const fill = (t, p) => ({ ...t, name: t.name?.replace('{name}', p.name) });

// default "section is showing" checks, driven by shared/content.js
const DEFAULT_SHOWN = {
  work: (page) => page.getByText(projects[0].name).first(),
  now: (page) => page.getByText(sections.now).first(),
  about: (page) => page.getByText(sections.about).first(),
  contact: (page) => page.locator(`a[href="mailto:${contact.email}"]`).first(),
};

export function hooksFor(proto) {
  const h = proto.hooks ?? {};
  return {
    // up to 2 clicks that reveal the project names on the first view
    reveal: (h.reveal ?? []).map(asTarget),
    // control that opens a project; "{name}" is swapped for the project name
    openProject: (project) => fill(asTarget(h.openProject ?? { name: '{name}' }), project),
    // nav control for each section, by accessible name
    nav: (section) => asTarget(h.nav?.[section] ?? DEFAULT_NAV[section]),
    // something that must be visible when a section is showing
    shown: (page, section) =>
      h.shown?.[section] ? locate(page, asTarget(h.shown[section])) : DEFAULT_SHOWN[section](page),
  };
}

export async function reveal(page, hooks) {
  for (const step of hooks.reveal.slice(0, 2)) await locate(page, step).click();
}

// press Tab until the target has focus. keyboard only, no clicks.
export async function tabTo(page, locator, max = 80) {
  await locator.waitFor({ state: 'attached', timeout: 5000 });
  for (let i = 0; i < max; i++) {
    await page.keyboard.press('Tab');
    if (await locator.evaluate((el) => el === document.activeElement, null, { timeout: 2000 })) return true;
  }
  return false;
}

export const runningAnimations = (page) =>
  page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length);
