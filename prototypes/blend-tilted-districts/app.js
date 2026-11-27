import { projects, contact, sections } from '../../shared/content.js';

const scene = document.querySelector('#scene');
const rig = document.querySelector('#rig');
const stage = document.querySelector('#stage');
const hud = document.querySelector('#hud');
const indexView = document.querySelector('#index');
const back = document.querySelector('#back');
const motionOff = document.documentElement.classList.contains('motion-off');
const byId = Object.fromEntries(projects.map((p) => [p.id, p]));

const blocks = [
  { id: 'now', word: 'Now', glyph: '◆', rise: 40 },
  { id: 'about', word: 'About', glyph: '●', rise: 34 },
  { id: 'work', word: 'Work', glyph: '▲', rise: 56 },
  { id: 'contact', word: 'Contact', glyph: '■', rise: 26 },
];

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function route() {
  return decodeURIComponent(location.hash.replace(/^#/, ''));
}

function plies(rise) {
  let html = '';
  for (let z = 6; z < rise; z += 8) html += `<i class="ply" style="transform:translateZ(${z}px)"></i>`;
  return html;
}

function studies() {
  return projects.map((p) => `<a class="study" id="obj-${esc(p.id)}" href="#work/${esc(p.id)}">
      <span class="name">${esc(p.name)}</span>
    </a>`).join('');
}

function detailHTML(project) {
  return `<span class="label"><span aria-hidden="true">▲</span> Work</span>
    <h2 class="name" id="title-${esc(project.id)}">${esc(project.name)}</h2>
    <p class="draft">draft copy</p>
    <p class="lede">${esc(project.description)}</p>
    <div class="actions">
      <button type="button" data-run="${esc(project.id)}">run it here</button>
      <a class="secondary" href="${esc(project.live)}" target="_blank" rel="noopener">live site</a>
      <a class="quiet" href="${esc(project.source)}">source</a>
    </div>
    <p class="fine">this is the real app. anything you type stays in your browser.</p>
    <div class="screen">
      <p class="screen-empty">not loaded yet.</p>
      <iframe title="${esc(project.name)}, running live" loading="lazy" hidden></iframe>
    </div>`;
}

function roofInner(block) {
  const label = `<a class="label" href="#${block.id}"><span aria-hidden="true">${block.glyph}</span> ${block.word}</a>`;
  if (block.id === 'work') {
    const details = projects.map((p) => `<div class="detail" data-for="${esc(p.id)}" hidden>${detailHTML(p)}</div>`).join('');
    return `${label}<div class="studies">${studies()}</div>${details}`;
  }
  if (block.id === 'now') {
    return `${label}<p class="draft">draft copy</p><p class="sentence">${esc(sections.now)}</p>`;
  }
  if (block.id === 'about') {
    return `${label}<p class="draft">draft copy</p><p class="sentence">${esc(sections.about)}</p>`;
  }
  return `${label}
    <span class="sentence">jack long</span>
    <div class="handles">
      <a href="${esc(contact.x)}" target="_blank" rel="noopener">X</a>
      <a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a>
      <a href="${esc(contact.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>
    </div>`;
}

function plotHTML(block) {
  return `<div class="plot ${block.id}" id="plot-${block.id}">
    <span class="shade ambient" aria-hidden="true"></span>
    <span class="shade contact" aria-hidden="true"></span>
    <div class="district" style="--rise:${block.rise}px">
      ${plies(block.rise)}
      <div class="roof" style="transform:translateZ(${block.rise}px)">${roofInner(block)}</div>
    </div>
  </div>`;
}

scene.innerHTML = `
  <i class="wood" style="transform:translateZ(0)"></i>
  <i class="wood" style="transform:translateZ(8px)"></i>
  <i class="wood" style="transform:translateZ(16px)"></i>
  <div class="ground" style="transform:translateZ(24px)">
    <span class="compass" aria-hidden="true">N</span>
    ${blocks.map(plotHTML).join('')}
  </div>`;

function indexHTML() {
  const items = projects.map((p) => `<li>
      <a href="#work/${esc(p.id)}">${esc(p.name)}</a> — ${esc(p.description)}
      <span class="draft">draft copy</span>
      <a href="${esc(p.live)}" target="_blank" rel="noopener">live site</a>
      <a href="${esc(p.source)}">source</a>
    </li>`).join('');
  indexView.innerHTML = `<div class="wrap">
    <p><a href="#">Back</a></p>
    <h1>Index</h1>
    <h2>▲ Work</h2><ul>${items}</ul>
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

const cam = { x: 0, y: 12, z: 0, tilt: 50, s: 1 };
const centers = {};
let manual = false;

function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

function measureAll() {
  const prev = rig.style.transform;
  const prevTr = rig.style.transition;
  rig.style.transition = 'none';
  rig.style.transform = 'none';
  const board = scene.getBoundingClientRect();
  const ox = board.left + board.width / 2;
  const oy = board.top + board.height / 2;
  scene.querySelectorAll('.plot').forEach((el) => {
    const r = el.getBoundingClientRect();
    centers[el.id] = {
      x: r.left + r.width / 2 - ox,
      y: r.top + r.height / 2 - oy,
    };
  });
  rig.style.transform = prev;
  rig.style.transition = prevTr;
}

function apply(next, instant) {
  cam.x = next.x;
  cam.y = next.y;
  cam.z = next.z;
  cam.tilt = next.tilt;
  cam.s = clamp(next.s, 1, 1.5);
  const snap = instant || motionOff;
  rig.style.transition = snap ? 'none' : 'transform .7s cubic-bezier(.16, .84, .24, 1)';
  rig.style.transform = `translate3d(${cam.x}px, ${cam.y}px, ${cam.z}px) rotateX(${cam.tilt}deg) scale(${cam.s})`;
  hud.textContent = `${Math.round(cam.s * 100)}%`;
}

function frame(el, tilt, scale, instant) {
  const s = clamp(scale, 1, 1.5);
  if (!el || !centers[el.id]) {
    apply({ x: 0, y: 12, z: 0, tilt: 50, s: 1 }, instant);
    return;
  }
  const { x, y } = centers[el.id];
  const c = Math.cos((tilt * Math.PI) / 180);
  const bias = y > 20 ? -80 : -12;
  apply({ x: -x * s, y: -y * c * s + bias, z: 0, tilt, s }, instant);
}

function viewFor(current) {
  const project = current.startsWith('work/');
  if (project || current === 'work') return { el: document.getElementById('plot-work'), tilt: 18, s: 1.5 };
  if (current === 'now' || current === 'about' || current === 'contact') {
    return { el: document.getElementById(`plot-${current}`), tilt: 18, s: 1.5 };
  }
  return { el: null, tilt: 50, s: 1 };
}

function bindTilt(district) {
  const plot = district.closest('.plot');
  const rest = () => {
    district.style.transform = '';
    plot.classList.remove('lifted');
  };
  const lift = (rx, ry) => {
    district.style.transform = `translateZ(46px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    plot.classList.add('lifted');
  };
  if (motionOff) {
    district.addEventListener('pointerenter', () => plot.classList.add('lifted'));
    district.addEventListener('pointerleave', rest);
    district.addEventListener('focusin', () => plot.classList.add('lifted'));
    district.addEventListener('focusout', rest);
    return;
  }
  district.addEventListener('pointermove', (e) => {
    const r = district.getBoundingClientRect();
    const px = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const py = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    lift(clamp(-py * 6, -6, 6), clamp(px * 6, -6, 6));
  });
  district.addEventListener('pointerleave', rest);
  district.addEventListener('focusin', () => lift(4, 0));
  district.addEventListener('focusout', rest);
}

scene.querySelectorAll('.district').forEach(bindTilt);

let booted = false;

function sync(fromUser) {
  const current = route();
  const projectId = current.startsWith('work/') ? current.slice(5) : '';
  indexView.hidden = current !== 'index';
  const work = document.getElementById('plot-work');
  work.classList.toggle('open', Boolean(projectId && byId[projectId]));
  work.querySelectorAll('.detail').forEach((d) => {
    d.hidden = d.dataset.for !== projectId;
  });
  document.querySelectorAll('.paths a').forEach((a) => {
    const href = a.getAttribute('href').slice(1);
    const on = current === href || current.startsWith(`${href}/`);
    if (on) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  const showBack = Boolean(current) && current !== 'index';
  back.hidden = !showBack;
  back.setAttribute('href', projectId ? '#work' : '#');
  const hint = document.querySelector('.hint');
  if (hint) hint.hidden = Boolean(current);
  document.title = (current ? `${current} — ` : '') + 'Tilted districts — Jack Long';
  const known = !current || current === 'work' || current === 'now' || current === 'about'
    || current === 'contact' || Boolean(projectId && byId[projectId]);
  if (current !== 'index' && !manual) {
    if (!booted) measureAll();
    const view = viewFor(known ? current : '');
    frame(view.el, view.tilt, view.s, !booted || motionOff);
  }
  if (fromUser && projectId) document.getElementById(`title-${projectId}`)?.focus();
  booted = true;
  manual = false;
}

scene.addEventListener('click', (e) => {
  const run = e.target.closest('[data-run]');
  if (!run) return;
  const project = byId[run.dataset.run];
  const detail = run.closest('.detail');
  const frameEl = detail?.querySelector('iframe');
  const empty = detail?.querySelector('.screen-empty');
  if (!project || !frameEl || frameEl.getAttribute('src')) return;
  frameEl.hidden = false;
  if (empty) empty.hidden = true;
  frameEl.src = project.live;
});

stage.addEventListener('wheel', (e) => {
  if (route() === 'index') return;
  e.preventDefault();
  manual = true;
  const dir = e.deltaY > 0 ? -1 : 1;
  const s = clamp(cam.s + dir * 0.08, 1, 1.5);
  const tilt = 50 - ((s - 1) / 0.5) * 32;
  apply({ ...cam, s, tilt }, motionOff);
}, { passive: false });

addEventListener('hashchange', () => sync(true));
addEventListener('resize', () => {
  manual = false;
  measureAll();
  sync(false);
});

addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const current = route();
  if (e.key === 'Escape') {
    if (!current) return;
    e.preventDefault();
    location.hash = current.startsWith('work/') ? 'work' : '';
    return;
  }
  if (current === 'index') return;
  if (e.key === '+' || e.key === '=') {
    e.preventDefault();
    manual = true;
    const s = clamp(cam.s + 0.08, 1, 1.5);
    apply({ ...cam, s, tilt: 50 - ((s - 1) / 0.5) * 32 }, motionOff);
    return;
  }
  if (e.key === '-' || e.key === '_') {
    e.preventDefault();
    manual = true;
    const s = clamp(cam.s - 0.08, 1, 1.5);
    apply({ ...cam, s, tilt: 50 - ((s - 1) / 0.5) * 32 }, motionOff);
    return;
  }
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
    e.preventDefault();
    manual = true;
    const step = 36;
    const x = cam.x + (e.key === 'ArrowLeft' ? step : e.key === 'ArrowRight' ? -step : 0);
    const y = cam.y + (e.key === 'ArrowUp' ? step : e.key === 'ArrowDown' ? -step : 0);
    apply({ ...cam, x, y }, motionOff);
    return;
  }
  const jump = { 1: 'work', 2: 'now', 3: 'about', 4: 'contact' }[e.key];
  if (jump) {
    e.preventDefault();
    location.hash = jump;
    return;
  }
  if ((e.key === ' ' || e.code === 'Space') && document.activeElement?.matches('a[href^="#"]')) {
    e.preventDefault();
    document.activeElement.click();
  }
});

addEventListener('focusin', (e) => {
  if (route() || motionOff) return;
  const plot = e.target.closest?.('.plot');
  if (!plot || !scene.contains(plot)) return;
  frame(plot, 34, 1.15, false);
});

indexHTML();
sync(false);
