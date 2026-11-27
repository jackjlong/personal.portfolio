import { projects, contact, sections } from '../../shared/content.js';

const scene = document.querySelector('#scene');
const panel = document.querySelector('#panel');
const indexView = document.querySelector('#index');
const byId = Object.fromEntries(projects.map((p) => [p.id, p]));

const desk = [
  ...projects.map((p, i) => ({
    id: p.id,
    route: `work/${p.id}`,
    kind: p.id === 'subscription-radar' ? 'radar' : 'timecard',
    word: 'Work',
    glyph: '▲',
    rot: i === 0 ? -7 : 6,
  })),
  { id: 'now', route: 'now', kind: 'note', word: 'Now', glyph: '◆', rot: -3.5 },
  { id: 'about', route: 'about', kind: 'badge', word: 'About', glyph: '●', rot: 2.5 },
  { id: 'contact', route: 'contact', kind: 'envelope', word: 'Contact', glyph: '■', rot: -2 },
];

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function route() {
  return decodeURIComponent(location.hash.replace(/^#/, ''));
}

function objectBody(item) {
  const project = byId[item.id];
  if (item.kind === 'timecard') {
    return `<span class="name">${esc(project.name)}</span>
      <span class="meta">time card</span>
      <span class="punches" aria-hidden="true"><i></i><i></i><i></i><i class="on"></i><i class="on"></i><i class="on"></i><i class="on"></i></span>`;
  }
  if (item.kind === 'radar') {
    return `<span class="name">${esc(project.name)}</span>
      <span class="meta">radar scope</span>
      <span class="scope" aria-hidden="true"><span class="sweep"></span></span>`;
  }
  if (item.kind === 'note') {
    return `<span class="tape" aria-hidden="true"></span>
      <span class="hand">${esc(sections.now)}</span>
      <span class="draft">draft copy</span>`;
  }
  if (item.kind === 'badge') {
    return `<span class="hole" aria-hidden="true"></span>
      <span class="mono" aria-hidden="true">JL</span>
      <span class="hand">${esc(sections.about)}</span>
      <span class="draft">draft copy</span>`;
  }
  return `<span class="flap" aria-hidden="true"></span>
    <span class="stamps" aria-hidden="true"><i>X</i><i>@</i><i>in</i></span>
    <span class="meta">envelope</span>`;
}

scene.innerHTML = desk.map((item) => `
  <a class="object ${item.kind}" id="obj-${item.id}" href="#${item.route}" style="--rot:${item.rot}deg">
    <span class="tag"><span class="glyph" aria-hidden="true">${item.glyph}</span> ${item.word}</span>
    ${objectBody(item)}
  </a>`).join('');

function projectSheet(project) {
  return `<div class="layout">
      <div>
        <p class="tag"><span aria-hidden="true">▲</span> Work</p>
        <h2 id="panel-title" tabindex="-1">${esc(project.name)}</h2>
        <p class="lede">${esc(project.description)}</p>
        <div class="actions">
          <a href="${esc(project.live)}">Live</a>
          <a href="${esc(project.source)}">Source</a>
          <a href="${esc(project.live)}" target="_blank" rel="noopener">Open in new tab</a>
          <button type="button" data-run="${esc(project.id)}">Run it here</button>
        </div>
        <p class="fine">This is the real app. Anything you type stays in your browser.</p>
      </div>
      <div class="monitor">
        <div class="bezel"><span>live app</span><span>local to your browser</span></div>
        <div class="screen">
          <p class="screen-empty">Not loaded yet. Run it here when you want the real app.</p>
          <iframe title="${esc(project.name)}, running live" loading="lazy" hidden></iframe>
        </div>
      </div>
    </div>`;
}

function workOverview() {
  const cards = projects.map((p) => `
    <a class="mini" href="#work/${esc(p.id)}" id="open-${esc(p.id)}">
      <span class="tag"><span aria-hidden="true">▲</span> Work</span>
      <span class="name">${esc(p.name)}</span>
      <span class="meta">${esc(p.description)}</span>
    </a>`).join('');
  return `<h2 id="panel-title" tabindex="-1">Work</h2>
    <p class="lede">Two small tools. Both run in the browser.</p>
    <div class="cards">${cards}</div>`;
}

function panelHTML(current) {
  const bar = `<div class="sheet-bar">
      <a href="#">Back to desk</a>
      <a href="#">Close</a>
    </div>`;
  if (current.startsWith('work/')) {
    const project = byId[current.slice(5)];
    if (!project) return '';
    return `<div class="sheet">${bar}${projectSheet(project)}</div>`;
  }
  if (current === 'work') return `<div class="sheet">${bar}${workOverview()}</div>`;
  if (current === 'now') {
    return `<div class="sheet">${bar}
      <p class="tag"><span aria-hidden="true">◆</span> Now</p>
      <h2 id="panel-title" tabindex="-1">Now</h2>
      <p class="draft">draft copy</p>
      <p class="lede hand">${esc(sections.now)}</p>
    </div>`;
  }
  if (current === 'about') {
    return `<div class="sheet">${bar}
      <p class="tag"><span aria-hidden="true">●</span> About</p>
      <h2 id="panel-title" tabindex="-1">About</h2>
      <p class="draft">draft copy</p>
      <p class="lede">${esc(sections.about)}</p>
    </div>`;
  }
  if (current === 'contact') {
    return `<div class="sheet">${bar}
      <p class="tag"><span aria-hidden="true">■</span> Contact</p>
      <h2 id="panel-title" tabindex="-1">Contact</h2>
      <div class="stamps-open">
        <a class="stamp" href="${esc(contact.x)}"><span>X</span> X</a>
        <a class="stamp" href="mailto:${esc(contact.email)}"><span>Email</span> ${esc(contact.email)}</a>
        <a class="stamp" href="${esc(contact.linkedin)}"><span>LinkedIn</span> LinkedIn</a>
      </div>
    </div>`;
  }
  return '';
}

function indexHTML() {
  const items = projects.map((p) => `<li>
      <a href="#work/${esc(p.id)}">${esc(p.name)}</a> —
      ${esc(p.description)}
      <a href="${esc(p.live)}">Live</a>
      <a href="${esc(p.source)}">Source</a>
    </li>`).join('');
  indexView.innerHTML = `<div class="wrap">
    <p><a href="#">Back to desk</a></p>
    <h1>Index</h1>
    <p>Plain list of the four paths and both projects.</p>
    <h2>▲ Work</h2>
    <ul>${items}</ul>
    <h2>◆ Now</h2>
    <p><a href="#now">Now</a> — <span class="draft">draft copy</span> ${esc(sections.now)}</p>
    <h2>● About</h2>
    <p><a href="#about">About</a> — <span class="draft">draft copy</span> ${esc(sections.about)}</p>
    <h2>■ Contact</h2>
    <ul>
      <li><a href="${esc(contact.x)}">X</a></li>
      <li><a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a></li>
      <li><a href="${esc(contact.linkedin)}">LinkedIn</a></li>
    </ul>
    <p><a href="../../">All concepts</a></p>
  </div>`;
}

const zoomFor = {
  work: 'work',
  now: 'now',
  about: 'about',
  contact: 'contact',
};

function focusFor(current) {
  if (current.startsWith('work/')) return `obj-${current.slice(5)}`;
  if (current === 'work') return 'obj-shiftme';
  if (current === 'index') return 'index-link';
  return `obj-${current}`;
}

let booted = false;
let returnFocus = null;

function sync(fromUser) {
  const current = route();
  const onIndex = current === 'index';
  indexView.hidden = !onIndex;
  const html = panelHTML(current);
  const open = Boolean(html);
  panel.hidden = !open;
  panel.innerHTML = html;
  const zoom = current.startsWith('work/') ? current.slice(5) : (zoomFor[current] || '');
  if (document.documentElement.classList.contains('motion-off')) scene.dataset.zoom = '';
  else scene.dataset.zoom = open || current === 'work' ? zoom : '';
  document.querySelectorAll('.paths a').forEach((a) => {
    const href = a.getAttribute('href').slice(1);
    const on = current === href || current.startsWith(`${href}/`);
    if (on) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  document.title = (current ? `${current} — ` : '') + 'Workbench — Jack Long';
  if (booted && fromUser !== false && open) {
    panel.querySelector('#panel-title')?.focus();
  }
  booted = true;
}

panel.addEventListener('click', (e) => {
  const run = e.target.closest('[data-run]');
  if (!run) {
    if (e.target === panel) location.hash = '';
    return;
  }
  const project = byId[run.dataset.run];
  const frame = panel.querySelector('iframe');
  const empty = panel.querySelector('.screen-empty');
  if (!project || !frame || frame.getAttribute('src')) return;
  frame.hidden = false;
  if (empty) empty.hidden = true;
  frame.src = project.live;
});

addEventListener('hashchange', () => sync(true));
addEventListener('click', (e) => {
  const object = e.target.closest('.object');
  if (object) returnFocus = object.id;
});

addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const current = route();
  if (e.key === 'Escape') {
    if (!current) return;
    e.preventDefault();
    const back = returnFocus || focusFor(current);
    location.hash = '';
    requestAnimationFrame(() => document.getElementById(back)?.focus());
    return;
  }
  const jump = { 1: 'work', 2: 'now', 3: 'about', 4: 'contact' }[e.key];
  if (jump) {
    e.preventDefault();
    if (e.key === '1' && !current) {
      document.getElementById('obj-shiftme')?.focus();
      return;
    }
    location.hash = jump;
    return;
  }
  if ((e.key === ' ' || e.code === 'Space') && document.activeElement?.matches('a[href^="#"]')) {
    e.preventDefault();
    document.activeElement.click();
  }
});

indexHTML();
sync(false);
