import { projects, contact, sections } from '../../shared/content.js';

const icons = document.querySelector('#icons');
const canvas = document.querySelector('#canvas');
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

const apps = [
  ...projects.map((p) => ({
    id: p.id,
    href: `#work/${p.id}`,
    name: p.name,
    word: 'Work',
    glyph: '▲',
    tone: 'work',
  })),
  { id: 'now', href: '#now', name: 'Now', word: 'Now', glyph: '◆', tone: 'now' },
  { id: 'about', href: '#about', name: 'About', word: 'About', glyph: '●', tone: 'about' },
  { id: 'contact', href: '#contact', name: 'Contact', word: 'Contact', glyph: '■', tone: 'contact' },
];

icons.innerHTML = apps.map((app) => `<a class="icon tone-${app.tone}" href="${app.href}" id="icon-${app.id}" aria-label="${esc(app.name)}">
    <span class="tile" aria-hidden="true">${app.glyph}</span>
    <span class="name">${esc(app.name)}</span>
    <span class="pathword"><span aria-hidden="true">${app.glyph}</span> ${app.word}</span>
  </a>`).join('');

document.querySelector('#nowline').textContent = sections.now;

function projectBody(project) {
  return `<div class="copy">
      <p class="pathword"><span aria-hidden="true">▲</span> Work</p>
      <h3>${esc(project.name)}</h3>
      <p class="lede">${esc(project.description)}</p>
      <div class="actions">
        <button type="button" class="primary" data-run="${esc(project.id)}">Run it here</button>
        <a class="secondary" href="${esc(project.live)}" target="_blank" rel="noopener">Live site</a>
        <a class="quiet" href="${esc(project.source)}">Source</a>
      </div>
      <p class="fine">This is the real app. Anything you type stays in your browser.</p>
    </div>
    <div class="screen">
      <p class="screen-empty">Not loaded yet. Run it here when you want the real app.</p>
      <iframe title="${esc(project.name)}, running live" hidden></iframe>
    </div>`;
}

function windowHTML(current) {
  const bar = (tone, glyph, word, title) => `<header class="titlebar tone-${tone}">
      <span class="pathword"><span aria-hidden="true">${glyph}</span> ${word}</span>
      <h2>${esc(title)}</h2>
      <button type="button" class="close" data-close>Close</button>
    </header>`;
  if (current.startsWith('work/')) {
    const project = byId[current.slice(5)];
    if (!project) return '';
    return `<div class="stack" aria-hidden="true"></div><article class="window tone-work">
      ${bar('work', '▲', 'Work', project.name)}
      <div class="body">${projectBody(project)}</div>
    </article>`;
  }
  if (current === 'work') {
    const cards = projects.map((p) => `<a href="#work/${esc(p.id)}">
        <span class="pathword"><span aria-hidden="true">▲</span> Work</span>
        <strong>${esc(p.name)}</strong>
        <span>${esc(p.description)}</span>
      </a>`).join('');
    return `<div class="stack" aria-hidden="true"></div><article class="window tone-work">
      ${bar('work', '▲', 'Work', 'Work')}
      <div class="body solo"><div class="pair">${cards}</div></div>
    </article>`;
  }
  if (current === 'now') {
    return `<div class="stack" aria-hidden="true"></div><article class="window tone-now">
      ${bar('now', '◆', 'Now', 'Now')}
      <div class="body solo"><div class="read">
        <p class="draft">draft copy</p>
        <h3>${esc(sections.now)}</h3>
      </div></div>
    </article>`;
  }
  if (current === 'about') {
    return `<div class="stack" aria-hidden="true"></div><article class="window tone-about">
      ${bar('about', '●', 'About', 'About')}
      <div class="body solo"><div class="read">
        <p class="draft">draft copy</p>
        <h3>${esc(sections.about)}</h3>
      </div></div>
    </article>`;
  }
  if (current === 'contact') {
    return `<div class="stack" aria-hidden="true"></div><article class="window tone-contact">
      ${bar('contact', '■', 'Contact', 'Contact')}
      <div class="body solo"><div class="handles">
        <a href="${esc(contact.x)}"><span>X</span> X</a>
        <a href="mailto:${esc(contact.email)}"><span>Email</span> ${esc(contact.email)}</a>
        <a href="${esc(contact.linkedin)}"><span>LinkedIn</span> LinkedIn</a>
      </div></div>
    </article>`;
  }
  return '';
}

function indexHTML() {
  const items = projects.map((p) => `<li><a href="#work/${esc(p.id)}">${esc(p.name)}</a> — ${esc(p.description)}
    <a href="${esc(p.live)}">Live</a> <a href="${esc(p.source)}">Source</a></li>`).join('');
  indexView.innerHTML = `<div class="wrap">
    <p><a href="#">Back to the desktop</a></p>
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

function tick() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Denver',
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date());
  const node = document.querySelector('#clock');
  if (node) node.textContent = parts;
}

const order = ['work', 'now', 'about', 'contact'];

function sync() {
  const current = route();
  indexView.hidden = current !== 'index';
  canvas.innerHTML = current === 'index' ? '' : windowHTML(current);
  document.querySelectorAll('.paths a, .icon').forEach((a) => {
    const href = a.getAttribute('href').slice(1);
    const on = current === href || (href !== 'work' && current === href) || (a.closest('.paths') && (current === href || current.startsWith(`${href}/`)));
    if (on) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  document.title = (current ? `${current} — ` : '') + 'Desktop — Jack Long';
}

canvas.addEventListener('click', (e) => {
  if (e.target.closest('[data-close]')) {
    const current = route();
    location.hash = current.startsWith('work/') ? 'work' : '';
    return;
  }
  const run = e.target.closest('[data-run]');
  if (!run) return;
  const project = byId[run.dataset.run];
  const frame = canvas.querySelector('iframe');
  const empty = canvas.querySelector('.screen-empty');
  if (!project || !frame || frame.getAttribute('src')) return;
  frame.hidden = false;
  if (empty) empty.hidden = true;
  frame.src = project.live;
});

let drag = null;
canvas.addEventListener('pointerdown', (e) => {
  const bar = e.target.closest('.titlebar');
  if (!bar || e.target.closest('button')) return;
  const win = bar.closest('.window');
  drag = { win, x: e.clientX, y: e.clientY, left: win.offsetLeft, top: win.offsetTop };
  bar.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.x;
  const dy = e.clientY - drag.y;
  drag.win.style.left = `${drag.left + dx}px`;
  drag.win.style.top = `${drag.top + dy}px`;
  drag.win.style.right = 'auto';
  drag.win.style.bottom = 'auto';
});
canvas.addEventListener('pointerup', () => { drag = null; });

addEventListener('hashchange', sync);
addEventListener('keydown', (e) => {
  if ((e.key === 'w' || e.key === 'W') && (e.metaKey || e.ctrlKey)) {
    if (!route()) return;
    e.preventDefault();
    location.hash = route().startsWith('work/') ? 'work' : '';
    return;
  }
  if (e.key === '`' || e.code === 'Backquote') {
    e.preventDefault();
    const current = route();
    const key = current.startsWith('work') ? 'work' : current;
    const i = Math.max(0, order.indexOf(key));
    location.hash = order[(i + 1) % order.length];
    return;
  }
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === 'Escape') {
    const current = route();
    if (!current) return;
    e.preventDefault();
    location.hash = current.startsWith('work/') ? 'work' : '';
    return;
  }
  if ((e.key === ' ' || e.code === 'Space') && document.activeElement?.matches('a[href^="#"]')) {
    e.preventDefault();
    document.activeElement.click();
    return;
  }
  if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
  const list = [...document.querySelectorAll('.icon')];
  const i = list.indexOf(document.activeElement);
  if (i < 0) return;
  e.preventDefault();
  list[i + (e.key === 'ArrowDown' ? 1 : -1)]?.focus();
});

indexHTML();
tick();
setInterval(tick, 30000);
sync();
