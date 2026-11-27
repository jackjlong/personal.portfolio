import { projects, contact, sections } from '../../shared/content.js';

const scene = document.querySelector('#scene');
const rig = document.querySelector('#rig');
const stage = document.querySelector('#stage');
const hud = document.querySelector('#hud');
const indexView = document.querySelector('#index');
const back = document.querySelector('#back');
const motionOff = document.documentElement.classList.contains('motion-off');
const byId = Object.fromEntries(projects.map((p) => [p.id, p]));
const PERSP = 1600;

const plates = [
  ...projects.map((p, i) => ({
    id: p.id,
    route: `work/${p.id}`,
    kind: p.id === 'subscription-radar' ? 'radar' : 'timecard',
    word: 'Work',
    glyph: '▲',
    rot: i === 0 ? -1.1 : 0.8,
    size: 'lg',
  })),
  { id: 'now', route: 'now', kind: 'note', word: 'Now', glyph: '◆', rot: -0.6, size: 'sm' },
  { id: 'about', route: 'about', kind: 'badge', word: 'About', glyph: '●', rot: 0.5, size: 'sm' },
  { id: 'contact', route: 'contact', kind: 'envelope', word: 'Contact', glyph: '■', rot: 0.9, size: 'sm' },
];

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function route() {
  return decodeURIComponent(location.hash.replace(/^#/, ''));
}

function faceBody(item) {
  const project = byId[item.id];
  if (item.kind === 'timecard') {
    return `<span class="kicker">time card</span>
      <span class="name">${esc(project.name)}</span>
      <span class="rules" aria-hidden="true"></span>
      <span class="punches" aria-hidden="true"><i></i><i class="on"></i><i></i><i class="on"></i><i class="on"></i><i></i></span>`;
  }
  if (item.kind === 'radar') {
    return `<span class="kicker">scope</span>
      <span class="name">${esc(project.name)}</span>
      <span class="dial" aria-hidden="true"><span class="sweep"></span><span class="needle"></span></span>`;
  }
  if (item.kind === 'note') {
    return `<span class="draft">draft copy</span>
      <span class="note-line">${esc(sections.now)}</span>`;
  }
  if (item.kind === 'badge') {
    return `<span class="draft">draft copy</span>
      <span class="note-line">${esc(sections.about)}</span>
      <span class="mono" aria-hidden="true">JL</span>`;
  }
  return `<span class="who">jack long</span>`;
}

function contactStamps() {
  return `<div class="stamps">
      <a href="${esc(contact.x)}" target="_blank" rel="noopener">X</a>
      <a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a>
      <a href="${esc(contact.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>
    </div>`;
}

function detailHTML(project) {
  return `<span class="tab"><span aria-hidden="true">▲</span> Work</span>
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

function seatHTML(item) {
  const project = byId[item.id];
  const detail = project ? `<div class="detail" hidden>${detailHTML(project)}</div>` : '';
  return `<div class="seat ${item.kind}" id="seat-${esc(item.id)}" data-route="${esc(item.route)}">
    <span class="shade ambient" aria-hidden="true"></span>
    <span class="shade contact" aria-hidden="true"></span>
    <div class="plate" style="--rot:${item.rot}deg">
      <a class="face" id="obj-${esc(item.id)}" href="#${esc(item.route)}">
        <span class="tab"><span aria-hidden="true">${item.glyph}</span> ${item.word}</span>
        ${faceBody(item)}
      </a>
      ${item.kind === 'envelope' ? contactStamps() : ''}
      ${detail}
    </div>
  </div>`;
}

scene.innerHTML = `
  <span class="tick nw" aria-hidden="true"></span>
  <span class="tick ne" aria-hidden="true"></span>
  <span class="tick sw" aria-hidden="true"></span>
  <span class="tick se" aria-hidden="true"></span>
  <span class="compass" aria-hidden="true">N</span>
  <p class="mast">
    <span class="who">jack long</span>
    <span class="draft">draft copy</span>
    <span class="mast-line">${esc(sections.now)}</span>
  </p>
  <div class="projects" id="projects">
    ${plates.filter((d) => d.size === 'lg').map(seatHTML).join('')}
  </div>
  <div class="rest" id="rest">
    ${plates.filter((d) => d.size === 'sm').map(seatHTML).join('')}
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

const cam = { x: 0, y: -8, z: 0, tilt: 50 };
const centers = {};
let manual = false;

function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

function measureAll() {
  const prev = rig.style.transform;
  const prevTr = rig.style.transition;
  rig.style.transition = 'none';
  rig.style.transform = 'none';
  const deskR = scene.getBoundingClientRect();
  const ox = deskR.left + deskR.width / 2;
  const oy = deskR.top + deskR.height / 2;
  scene.querySelectorAll('.seat, #projects').forEach((el) => {
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
  const snap = instant || motionOff;
  rig.style.transition = snap ? 'none' : 'transform .72s cubic-bezier(.16, .84, .24, 1)';
  rig.style.transform = `translate3d(${cam.x}px, ${cam.y}px, ${cam.z}px) rotateX(${cam.tilt}deg)`;
  const pct = Math.round((PERSP / (PERSP - cam.z)) * 100);
  hud.textContent = `${pct}%`;
}

function frame(el, tilt, z, instant) {
  if (!el || !centers[el.id]) {
    apply({ x: 0, y: -8, z: 0, tilt: 50 }, instant);
    return;
  }
  const { x, y } = centers[el.id];
  const c = Math.cos((tilt * Math.PI) / 180);
  const bias = y > 40 ? -120 : (z > 280 ? -28 : 0);
  apply({ x: -x, y: -y * c + bias, z, tilt }, instant);
}

function viewFor(current) {
  if (current.startsWith('work/')) {
    const id = current.slice(5);
    return { el: document.getElementById(`seat-${id}`), tilt: 28, z: 460 };
  }
  if (current === 'work') return { el: document.getElementById('projects'), tilt: 36, z: 200 };
  if (current === 'now' || current === 'about' || current === 'contact') {
    return { el: document.getElementById(`seat-${current}`), tilt: 30, z: 440 };
  }
  return { el: null, tilt: 50, z: 0 };
}

function bindTilt(plate) {
  const seat = plate.closest('.seat');
  const rest = () => {
    plate.style.transform = '';
    seat.classList.remove('lifted');
  };
  const lift = (rx, ry) => {
    plate.style.transform = `rotateZ(var(--rot)) translateZ(78px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    seat.classList.add('lifted');
  };
  if (motionOff) {
    plate.addEventListener('pointerenter', () => seat.classList.add('lifted'));
    plate.addEventListener('pointerleave', rest);
    plate.addEventListener('focusin', () => seat.classList.add('lifted'));
    plate.addEventListener('focusout', rest);
    return;
  }
  plate.addEventListener('pointermove', (e) => {
    const r = plate.getBoundingClientRect();
    const px = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const py = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    const ry = clamp(px * 6, -6, 6);
    const rx = clamp(-py * 6, -6, 6);
    lift(rx, ry);
  });
  plate.addEventListener('pointerleave', rest);
  plate.addEventListener('focusin', () => lift(4, 0));
  plate.addEventListener('focusout', rest);
}

scene.querySelectorAll('.plate').forEach(bindTilt);

let booted = false;

function sync(fromUser) {
  const current = route();
  const known = current === 'index' || current === 'work' || current === 'now'
    || current === 'about' || current === 'contact' || current.startsWith('work/');
  indexView.hidden = current !== 'index';
  scene.querySelectorAll('.seat').forEach((seat) => {
    const on = seat.dataset.route === current;
    seat.classList.toggle('open', on);
    const detail = seat.querySelector('.detail');
    if (detail) detail.hidden = !on;
  });
  document.querySelectorAll('.paths a').forEach((a) => {
    const href = a.getAttribute('href').slice(1);
    const on = current === href || current.startsWith(`${href}/`);
    if (on) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  const showBack = Boolean(current) && current !== 'index';
  back.hidden = !showBack;
  document.querySelector('.hint').hidden = Boolean(current);
  if (current.startsWith('work/')) back.setAttribute('href', '#work');
  else back.setAttribute('href', '#');
  document.title = (current ? `${current} — ` : '') + 'Desk map — Jack Long';
  if (current !== 'index' && !manual) {
    if (!booted) measureAll();
    const view = viewFor(known ? current : '');
    frame(view.el, view.tilt, view.z, !booted || motionOff);
  }
  if (fromUser && current.startsWith('work/')) {
    document.getElementById(`title-${current.slice(5)}`)?.focus();
  }
  booted = true;
  manual = false;
}

scene.addEventListener('click', (e) => {
  const run = e.target.closest('[data-run]');
  if (!run) return;
  const project = byId[run.dataset.run];
  const seat = run.closest('.seat');
  const frameEl = seat.querySelector('iframe');
  const empty = seat.querySelector('.screen-empty');
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
  const z = clamp(cam.z + dir * 80, 0, 760);
  const tilt = 50 - (z / 760) * 20;
  apply({ ...cam, z, tilt }, motionOff);
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
    const z = clamp(cam.z + 80, 0, 760);
    apply({ ...cam, z, tilt: 50 - (z / 760) * 20 }, motionOff);
    return;
  }
  if (e.key === '-' || e.key === '_') {
    e.preventDefault();
    manual = true;
    const z = clamp(cam.z - 80, 0, 760);
    apply({ ...cam, z, tilt: 50 - (z / 760) * 20 }, motionOff);
    return;
  }
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
    e.preventDefault();
    manual = true;
    const step = 48;
    const x = cam.x + (e.key === 'ArrowLeft' ? step : e.key === 'ArrowRight' ? -step : 0);
    const y = cam.y + (e.key === 'ArrowUp' ? step : e.key === 'ArrowDown' ? -step : 0);
    apply({ ...cam, x, y }, motionOff);
    return;
  }
  const jump = { 1: 'work', 2: 'now', 3: 'about', 4: 'contact' }[e.key];
  if (jump && document.activeElement?.tagName !== 'INPUT') {
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
  const seat = e.target.closest?.('.seat');
  if (!seat || !scene.contains(seat)) return;
  frame(seat, 40, 220, false);
});

indexHTML();
sync(false);
