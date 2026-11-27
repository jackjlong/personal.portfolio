import { projects, contact, sections } from '../../shared/content.js';

const rail = document.querySelector('#rail');
const board = document.querySelector('#board');
const gate = document.querySelector('#gate');
const indexView = document.querySelector('#index');
const byId = Object.fromEntries(projects.map((p) => [p.id, p]));

const tones = {
  work: { glyph: '▲', word: 'Work', tone: 'work' },
  now: { glyph: '◆', word: 'Now', tone: 'now' },
  about: { glyph: '●', word: 'About', tone: 'about' },
  contact: { glyph: '■', word: 'Contact', tone: 'contact' },
};

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function route() {
  return decodeURIComponent(location.hash.replace(/^#/, ''));
}

function flaps(text, row) {
  let n = 0;
  return [...text].map((ch) => {
    if (ch === ' ') return '<span class="gap"> </span>';
    const delay = row * 80 + n * 28;
    n += 1;
    return `<span class="cell" style="--d:${delay}ms"><span class="letter">${esc(ch)}</span><span class="hinge" aria-hidden="true"></span></span>`;
  }).join('');
}

const rows = [
  ...projects.map((p, i) => ({
    id: p.id,
    href: `#work/${p.id}`,
    label: p.name,
    tone: 'work',
    gate: `W${i + 1}`,
    status: 'Live',
  })),
  { id: 'now', href: '#now', label: 'Building', tone: 'now', gate: 'N', status: 'On time' },
  { id: 'about', href: '#about', label: 'About Jack', tone: 'about', gate: 'A', status: 'Boarding' },
  { id: 'contact', href: '#contact', label: 'Say hi', tone: 'contact', gate: 'C', status: 'Open' },
];

rail.innerHTML = ['work', 'now', 'about', 'contact'].map((id) => {
  const t = tones[id];
  return `<a class="slab slab-${id}" href="#${id}" id="nav-${id}"><span class="glyph" aria-hidden="true">${t.glyph}</span><span class="word">${t.word}</span></a>`;
}).join('');

board.innerHTML = `
  <div class="cols" aria-hidden="true"><span>Dest</span><span>Type</span><span>Gate</span><span>Status</span></div>
  <ul class="rows">
    ${rows.map((row, i) => {
      const t = tones[row.tone];
      const access = row.tone === 'work' && byId[row.id] ? row.label : tones[row.tone].word;
      return `<li class="row">
        <a class="row-link tone-${row.tone}" href="${row.href}" id="row-${row.id}" aria-label="${esc(access)}">
          <span class="dest" aria-hidden="true">${flaps(row.label, i)}</span>
          <span class="kind"><span aria-hidden="true">${t.glyph}</span> ${t.word}</span>
          <span class="gatecode">${row.gate}</span>
          <span class="status"><i aria-hidden="true"></i> ${row.status}</span>
        </a>
      </li>`;
    }).join('')}
  </ul>`;

function projectDetail(project) {
  return `<div class="gate-copy">
      <p class="path"><span aria-hidden="true">▲</span> Work</p>
      <h2>${esc(project.name)}</h2>
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

function workOverview() {
  const cards = projects.map((p) => `<a class="pair-card" href="#work/${esc(p.id)}">
      <span class="path"><span aria-hidden="true">▲</span> Work</span>
      <strong>${esc(p.name)}</strong>
      <em>${esc(p.description)}</em>
    </a>`).join('');
  return `<div class="pair">${cards}</div>`;
}

function gateHTML(current) {
  if (current.startsWith('work/')) {
    const project = byId[current.slice(5)];
    return project ? { tone: 'work', html: projectDetail(project) } : null;
  }
  if (current === 'work') return { tone: 'work', html: workOverview() };
  if (current === 'now') {
    return {
      tone: 'now',
      html: `<div class="read">
        <p class="path"><span aria-hidden="true">◆</span> Now</p>
        <p class="draft">draft copy</p>
        <h2>${esc(sections.now)}</h2>
      </div>`,
    };
  }
  if (current === 'about') {
    return {
      tone: 'about',
      html: `<div class="read">
        <p class="path"><span aria-hidden="true">●</span> About</p>
        <p class="draft">draft copy</p>
        <h2>${esc(sections.about)}</h2>
      </div>`,
    };
  }
  if (current === 'contact') {
    return {
      tone: 'contact',
      html: `<div class="contact-list">
        <a href="${esc(contact.x)}"><span>X</span> X</a>
        <a href="mailto:${esc(contact.email)}"><span>Email</span> ${esc(contact.email)}</a>
        <a href="${esc(contact.linkedin)}"><span>LinkedIn</span> LinkedIn</a>
      </div>`,
    };
  }
  return null;
}

function indexHTML() {
  const items = projects.map((p) => `<li><a href="#work/${esc(p.id)}">${esc(p.name)}</a> — ${esc(p.description)}
    <a href="${esc(p.live)}">Live</a> <a href="${esc(p.source)}">Source</a></li>`).join('');
  indexView.innerHTML = `<div class="wrap">
    <p><a href="#">Back to the board</a></p>
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
  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Denver',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date());
  const node = document.querySelector('#clock');
  if (node) node.textContent = `${time} MT`;
}

function sync() {
  const current = route();
  indexView.hidden = current !== 'index';
  const next = current === 'index' ? null : gateHTML(current);
  board.classList.toggle('is-open', Boolean(next));
  gate.hidden = !next;
  gate.className = `gate${next ? ` gate-${next.tone}` : ''}`;
  gate.innerHTML = next ? next.html : '';
  document.querySelectorAll('.slab, .row-link').forEach((a) => {
    const href = a.getAttribute('href').slice(1);
    const on = current === href || (href === 'work' && current.startsWith('work/'));
    if (on) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  document.title = (current ? `${current} — ` : '') + 'Departures — Jack Long';
}

gate.addEventListener('click', (e) => {
  const run = e.target.closest('[data-run]');
  if (!run) return;
  const project = byId[run.dataset.run];
  const frame = gate.querySelector('iframe');
  const empty = gate.querySelector('.screen-empty');
  if (!project || !frame || frame.getAttribute('src')) return;
  frame.hidden = false;
  if (empty) empty.hidden = true;
  frame.src = project.live;
});

addEventListener('hashchange', sync);
addEventListener('keydown', (e) => {
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
  const list = [...document.querySelectorAll('.row-link')];
  const i = list.indexOf(document.activeElement);
  if (i < 0) return;
  e.preventDefault();
  list[i + (e.key === 'ArrowDown' ? 1 : -1)]?.focus();
});

indexHTML();
tick();
setInterval(tick, 30000);
sync();
