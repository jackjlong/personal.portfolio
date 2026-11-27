import { projects, contact, sections } from '../../shared/content.js';

const stage = document.querySelector('#fields');
const indexView = document.querySelector('#index');
const byId = Object.fromEntries(projects.map((p) => [p.id, p]));

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function route() {
  return decodeURIComponent(location.hash.replace(/^#/, ''));
}

const slabs = projects.map((p) => `
  <a class="slab" href="#work/${esc(p.id)}" id="slab-${esc(p.id)}">
    <strong>${esc(p.name)}</strong>
    <em>${esc(p.description)}</em>
  </a>`).join('');

stage.innerHTML = `
  <section class="field field-work" data-section="work">
    <a class="field-link" href="#work" id="nav-work"><span class="glyph" aria-hidden="true">▲</span><span class="word">Work</span></a>
    <div class="field-body">
      <div class="slabs">${slabs}</div>
      <div class="detail" id="detail" hidden></div>
    </div>
  </section>
  <section class="field field-now" data-section="now">
    <a class="field-link" href="#now" id="nav-now"><span class="glyph" aria-hidden="true">◆</span><span class="word">Now</span></a>
    <div class="field-body">
      <p class="draft">draft copy</p>
      <p class="sentence">${esc(sections.now)}</p>
    </div>
  </section>
  <section class="field field-about" data-section="about">
    <a class="field-link" href="#about" id="nav-about"><span class="glyph" aria-hidden="true">●</span><span class="word">About</span></a>
    <div class="field-body">
      <p class="draft">draft copy</p>
      <p class="sentence">${esc(sections.about)}</p>
    </div>
  </section>
  <section class="field field-contact" data-section="contact">
    <a class="field-link" href="#contact" id="nav-contact"><span class="glyph" aria-hidden="true">■</span><span class="word">Contact</span></a>
    <div class="field-body">
      <div class="handles">
        <a href="${esc(contact.x)}">X</a>
        <a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a>
        <a href="${esc(contact.linkedin)}">LinkedIn</a>
      </div>
    </div>
  </section>`;

function detailHTML(project) {
  return `<p><a class="ghost" href="#work">Both projects</a></p>
    <h2 id="panel-title" tabindex="-1">${esc(project.name)}</h2>
    <p class="lede">${esc(project.description)}</p>
    <div class="actions">
      <a href="${esc(project.live)}">Live</a>
      <a href="${esc(project.source)}">Source</a>
      <a href="${esc(project.live)}" target="_blank" rel="noopener">Open in new tab</a>
      <button type="button" data-run="${esc(project.id)}">Run it here</button>
    </div>
    <p class="fine">This is the real app. Anything you type stays in your browser.</p>
    <div class="screen">
      <p class="screen-empty">Not loaded yet. Run it here when you want the real app.</p>
      <iframe title="${esc(project.name)}, running live" loading="lazy" hidden></iframe>
    </div>`;
}

function indexHTML() {
  const items = projects.map((p) => `<li><a href="#work/${esc(p.id)}">${esc(p.name)}</a> — ${esc(p.description)}
    <a href="${esc(p.live)}">Live</a> <a href="${esc(p.source)}">Source</a></li>`).join('');
  indexView.innerHTML = `<div class="wrap">
    <p><a href="#">Back to the fields</a></p>
    <h1>Index</h1>
    <h2>▲ Work</h2><ul>${items}</ul>
    <h2>◆ Now</h2><p><a href="#now">Now</a> — <span class="draft">draft copy</span> ${esc(sections.now)}</p>
    <h2>● About</h2><p><a href="#about">About</a> — <span class="draft">draft copy</span> ${esc(sections.about)}</p>
    <h2>■ Contact</h2>
    <ul>
      <li><a href="${esc(contact.x)}">X</a></li>
      <li><a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a></li>
      <li><a href="${esc(contact.linkedin)}">LinkedIn</a></li>
    </ul>
    <p><a href="../../">All concepts</a></p>
  </div>`;
}

const grid = {
  work: [0, 0], now: [1, 0], about: [0, 1], contact: [1, 1],
};
const at = { '0,0': 'work', '1,0': 'now', '0,1': 'about', '1,1': 'contact' };

function sectionOf(current) {
  if (!current || current === 'index') return null;
  if (current.startsWith('work')) return 'work';
  return current;
}

let booted = false;

function sync(fromUser) {
  const current = route();
  const section = sectionOf(current);
  const project = current.startsWith('work/') ? byId[current.slice(5)] : null;
  indexView.hidden = current !== 'index';
  if (section) stage.dataset.open = section;
  else delete stage.dataset.open;
  document.querySelectorAll('.field').forEach((field) => {
    field.classList.toggle('is-open', field.dataset.section === section);
  });
  document.querySelectorAll('.field-link').forEach((link) => {
    const on = link.id === `nav-${section}`;
    if (on) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  const detail = document.querySelector('#detail');
  detail.hidden = !project;
  detail.innerHTML = project ? detailHTML(project) : '';
  document.querySelectorAll('.slab').forEach((slab) => {
    slab.classList.toggle('is-selected', project && slab.id === `slab-${project.id}`);
  });
  document.querySelector('.mark').style.display = section ? 'none' : '';
  document.title = (current ? `${current} — ` : '') + 'Color fields — Jack Long';
  if (booted && fromUser !== false && project) detail.querySelector('#panel-title')?.focus();
  booted = true;
}

stage.addEventListener('click', (e) => {
  const run = e.target.closest('[data-run]');
  if (run) {
    const project = byId[run.dataset.run];
    const frame = stage.querySelector('iframe');
    const empty = stage.querySelector('.screen-empty');
    if (!frame || frame.getAttribute('src')) return;
    frame.hidden = false;
    if (empty) empty.hidden = true;
    frame.src = project.live;
    return;
  }
  if (e.target.closest('a, button')) return;
  const field = e.target.closest('.field');
  if (!field) return;
  location.hash = field.dataset.section;
});

function neighbor(section, key) {
  const [c, r] = grid[section];
  const delta = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[key];
  if (!delta) return section;
  const nc = Math.max(0, Math.min(1, c + delta[0]));
  const nr = Math.max(0, Math.min(1, r + delta[1]));
  return at[`${nc},${nr}`];
}

function cycleProject(dir) {
  const ids = projects.map((p) => p.id);
  let idx = ids.findIndex((id) => route() === `work/${id}`);
  if (idx < 0) idx = dir > 0 ? -1 : 0;
  location.hash = `work/${ids[(idx + dir + ids.length) % ids.length]}`;
}

addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const current = route();
  if (e.key === 'Escape') {
    if (!current) return;
    e.preventDefault();
    location.hash = current.startsWith('work/') ? 'work' : '';
    if (!current.startsWith('work/')) requestAnimationFrame(() => document.getElementById('nav-work')?.focus());
    return;
  }
  const jump = { 1: 'work', 2: 'now', 3: 'about', 4: 'contact' }[e.key];
  if (jump) { e.preventDefault(); location.hash = jump; return; }
  if ((e.key === ' ' || e.code === 'Space') && document.activeElement?.matches('a[href^="#"]')) {
    e.preventDefault();
    document.activeElement.click();
    return;
  }
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
  e.preventDefault();
  const section = sectionOf(current);
  if (!section) {
    const focused = document.activeElement?.closest?.('.field')?.dataset.section || 'work';
    const next = neighbor(focused, e.key);
    document.getElementById(`nav-${next}`)?.focus();
    return;
  }
  if (section === 'work' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
    cycleProject(e.key === 'ArrowRight' ? 1 : -1);
    return;
  }
  location.hash = neighbor(section, e.key);
});

addEventListener('hashchange', () => sync(true));
indexHTML();
sync(false);
