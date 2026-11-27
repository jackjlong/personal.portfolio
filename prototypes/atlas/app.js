import { projects, contact, sections } from '../../shared/content.js';

const world = document.querySelector('#world');
const dots = document.querySelector('#dots');
const viewport = document.querySelector('#map');
const overlay = document.querySelector('#overlay');
const indexView = document.querySelector('#index');
const minimap = document.querySelector('#minimap');
const zoomRead = document.querySelector('#zoom-read');
const motionOff = document.documentElement.classList.contains('motion-off');
const byId = Object.fromEntries(projects.map((p) => [p.id, p]));

const spots = {
  home: { x: 0, y: 0, w: 340, h: 268 },
  now: { x: 0, y: -250, w: 270, h: 180 },
  about: { x: -360, y: 16, w: 270, h: 190 },
  work: { x: 390, y: 0, w: 420, h: 260 },
  contact: { x: 16, y: 276, w: 290, h: 180 },
};

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function route() {
  return decodeURIComponent(location.hash.replace(/^#/, ''));
}

const sheets = projects.map((p, i) => {
  const rot = i === 0 ? -6 : 5;
  return `<a class="sheet" data-x="${spots.work.x + (i === 0 ? -95 : 95)}" data-y="${spots.work.y + 28}" data-w="180" data-h="130" href="#work/${esc(p.id)}" id="sheet-${esc(p.id)}" style="--rot:${rot}deg">
      <strong>${esc(p.name)}</strong>
      <span>${esc(p.description)}</span>
    </a>`;
}).join('');

world.innerHTML = `
  <article class="plate home" data-x="0" data-y="0" data-w="340" data-h="268" id="home-card">
    <div class="mark">JL</div>
    <h1>Jack Long</h1>
    <p class="identity">Two private tools that live in the browser.</p>
    <ul class="legend">
      <li class="leg-work"><span aria-hidden="true">▲</span> Work</li>
      <li class="leg-now"><span aria-hidden="true">◆</span> Now</li>
      <li class="leg-about"><span aria-hidden="true">●</span> About</li>
      <li class="leg-contact"><span aria-hidden="true">■</span> Contact</li>
    </ul>
  </article>
  <article class="plate district now" data-x="${spots.now.x}" data-y="${spots.now.y}" data-w="${spots.now.w}" data-h="${spots.now.h}">
    <a class="district-link" href="#now"><span aria-hidden="true">◆</span> Now</a>
    <p class="sentence">${esc(sections.now)}</p>
    <span class="draft">draft copy</span>
  </article>
  <article class="plate district about" data-x="${spots.about.x}" data-y="${spots.about.y}" data-w="${spots.about.w}" data-h="${spots.about.h}">
    <a class="district-link" href="#about"><span aria-hidden="true">●</span> About</a>
    <p class="sentence">${esc(sections.about)}</p>
    <span class="draft">draft copy</span>
  </article>
  <article class="plate district work" data-x="${spots.work.x}" data-y="${spots.work.y}" data-w="${spots.work.w}" data-h="${spots.work.h}">
    <a class="district-link" href="#work"><span aria-hidden="true">▲</span> Work</a>
    <div class="sheets">${sheets}</div>
  </article>
  <article class="plate district contact" data-x="${spots.contact.x}" data-y="${spots.contact.y}" data-w="${spots.contact.w}" data-h="${spots.contact.h}">
    <a class="district-link" href="#contact"><span aria-hidden="true">■</span> Contact</a>
    <div class="handles">
      <a href="${esc(contact.x)}">X</a>
      <a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a>
      <a href="${esc(contact.linkedin)}">LinkedIn</a>
    </div>
  </article>`;

function place() {
  document.querySelectorAll('.plate').forEach((el) => {
    const w = +el.dataset.w;
    const h = +el.dataset.h || el.offsetHeight || 120;
    el.style.left = `${+el.dataset.x - w / 2}px`;
    el.style.top = `${+el.dataset.y - h / 2}px`;
    if (el.dataset.w) el.style.width = `${w}px`;
    if (el.classList.contains('plate')) el.style.minHeight = `${+el.dataset.h}px`;
    if (el.id === 'detail-plate') el.style.height = `${+el.dataset.h}px`;
  });
}

const cam = { x: 0, y: 0, s: 1 };
let armed = false;

function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

function apply() {
  const tilt = motionOff ? 0 : Math.min(9, 3.5 + Math.max(0, cam.s - 0.85) * 5);
  world.style.setProperty('--tilt', `${tilt.toFixed(2)}deg`);
  world.style.transform = `translate(${cam.x}px, ${cam.y}px) scale(${cam.s})`;
  dots.style.transform = `translate(${cam.x * 0.6}px, ${cam.y * 0.6}px)`;
  zoomRead.textContent = `${Math.round(cam.s * 100)}%`;
  drawMinimap();
  if (!armed) {
    requestAnimationFrame(() => {
      armed = true;
      world.classList.add('armed');
      dots.classList.add('armed');
    });
  }
}

function frameBox(x, y, w, h, pad = 72, cap = 3) {
  const vp = viewport.getBoundingClientRect();
  let s = Math.min((vp.width - pad) / w, (vp.height - pad) / h);
  s = clamp(Math.min(s, cap), 0.4, 3);
  cam.s = s;
  cam.x = vp.width / 2 - (x + w / 2) * s;
  cam.y = vp.height / 2 - (y + h / 2) * s;
  apply();
}

function frameSpot(name, cap) {
  const spot = spots[name];
  frameBox(spot.x - spot.w / 2, spot.y - spot.h / 2, spot.w, spot.h, 80, cap);
}

function frameHome() {
  const boxes = Object.values(spots);
  const minX = Math.min(...boxes.map((b) => b.x - b.w / 2));
  const minY = Math.min(...boxes.map((b) => b.y - b.h / 2));
  const maxX = Math.max(...boxes.map((b) => b.x + b.w / 2));
  const maxY = Math.max(...boxes.map((b) => b.y + b.h / 2));
  frameBox(minX, minY, maxX - minX, maxY - minY, 70, 1.08);
}

function zoomAt(clientX, clientY, delta) {
  const vp = viewport.getBoundingClientRect();
  const cx = clientX - vp.left;
  const cy = clientY - vp.top;
  const wx = (cx - cam.x) / cam.s;
  const wy = (cy - cam.y) / cam.s;
  const factor = delta > 0 ? 0.9 : 1.1;
  cam.s = clamp(cam.s * factor, 0.4, 3);
  cam.x = cx - wx * cam.s;
  cam.y = cy - wy * cam.s;
  apply();
}

function zoomCenter(factor) {
  const vp = viewport.getBoundingClientRect();
  zoomAt(vp.left + vp.width / 2, vp.top + vp.height / 2, factor > 1 ? -1 : 1);
}

function drawMinimap() {
  const boxes = Object.entries(spots);
  const minX = Math.min(...boxes.map(([, b]) => b.x - b.w / 2)) - 80;
  const minY = Math.min(...boxes.map(([, b]) => b.y - b.h / 2)) - 80;
  const maxX = Math.max(...boxes.map(([, b]) => b.x + b.w / 2)) + 80;
  const maxY = Math.max(...boxes.map(([, b]) => b.y + b.h / 2)) + 80;
  const mw = minimap.clientWidth;
  const mh = minimap.clientHeight;
  const sx = mw / (maxX - minX);
  const sy = mh / (maxY - minY);
  const colors = { home: '#f6f1e7', now: '#1e4ecc', about: '#5c35c9', work: '#f28c28', contact: '#ffd23f' };
  const dotsHtml = boxes.map(([name, b]) => {
    const left = (b.x - minX) * sx - 4;
    const top = (b.y - minY) * sy - 4;
    return `<i style="left:${left}px;top:${top}px;background:${colors[name]}"></i>`;
  }).join('');
  const vp = viewport.getBoundingClientRect();
  const vx = (-cam.x / cam.s - minX) * sx;
  const vy = (-cam.y / cam.s - minY) * sy;
  const vw = (vp.width / cam.s) * sx;
  const vh = (vp.height / cam.s) * sy;
  minimap.innerHTML = `${dotsHtml}<b style="left:${vx}px;top:${vy}px;width:${vw}px;height:${vh}px"></b>`;
}

function projectHTML(project) {
  return `<article class="reading">
    <div class="copy">
      <p><a class="back" href="#work">Back</a></p>
      <p class="district-link"><span aria-hidden="true">▲</span> Work</p>
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
      <iframe title="${esc(project.name)}, running live" loading="lazy" hidden></iframe>
    </div>
  </article>`;
}

function detailPlate() {
  let plate = document.querySelector('#detail-plate');
  if (!plate) {
    plate = document.createElement('article');
    plate.id = 'detail-plate';
    plate.className = 'plate detail-plate';
    plate.hidden = true;
    world.appendChild(plate);
  }
  return plate;
}

function indexHTML() {
  const items = projects.map((p) => `<li><a href="#work/${esc(p.id)}">${esc(p.name)}</a> — ${esc(p.description)}
    <a href="${esc(p.live)}">Live</a> <a href="${esc(p.source)}">Source</a></li>`).join('');
  indexView.innerHTML = `<div class="wrap">
    <p><a href="#">Back to the map</a></p>
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

function sync() {
  const current = route();
  indexView.hidden = current !== 'index';
  const project = current.startsWith('work/') ? byId[current.slice(5)] : null;
  const detail = detailPlate();
  overlay.hidden = true;
  if (project) {
    detail.hidden = false;
    detail.dataset.x = '700';
    detail.dataset.y = '24';
    detail.dataset.w = '640';
    detail.dataset.h = '420';
    detail.innerHTML = projectHTML(project);
  } else {
    detail.hidden = true;
    detail.innerHTML = '';
  }
  place();
  document.querySelectorAll('.paths a').forEach((a) => {
    const href = a.getAttribute('href').slice(1);
    const on = current === href || current.startsWith(`${href}/`);
    if (on) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  if (current === 'index') {
    /* leave the camera */
  } else if (project) {
    frameBox(700 - 320, 24 - 210, 640, 420, 48, 1.55);
  } else if (spots[current]) frameSpot(current, 1.55);
  else frameHome();
  document.body.classList.toggle('project-open', Boolean(project));
  document.title = (current ? `${current} — ` : '') + 'Atlas — Jack Long';
}

world.addEventListener('click', (e) => {
  const run = e.target.closest('[data-run]');
  if (!run) return;
  const project = byId[run.dataset.run];
  const frame = world.querySelector('#detail-plate iframe');
  const empty = world.querySelector('#detail-plate .screen-empty');
  if (!project || !frame || frame.getAttribute('src')) return;
  frame.hidden = false;
  if (empty) empty.hidden = true;
  frame.src = project.live;
});

document.querySelector('#zoom-in').addEventListener('click', () => zoomCenter(1.1));
document.querySelector('#zoom-out').addEventListener('click', () => zoomCenter(0.9));
document.querySelector('#home').addEventListener('click', () => { location.hash = ''; if (!route()) frameHome(); });

let drag = null;
let suppressClick = false;
viewport.addEventListener('pointerdown', (e) => {
  if (e.button !== 0) return;
  drag = { x: e.clientX, y: e.clientY, cx: cam.x, cy: cam.y, moved: false };
});
viewport.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.x;
  const dy = e.clientY - drag.y;
  if (Math.hypot(dx, dy) > 5) drag.moved = true;
  if (!drag.moved) return;
  cam.x = drag.cx + dx;
  cam.y = drag.cy + dy;
  apply();
});
function endDrag() {
  if (drag?.moved) suppressClick = true;
  drag = null;
}
viewport.addEventListener('pointerup', endDrag);
viewport.addEventListener('pointercancel', endDrag);
document.addEventListener('click', (e) => {
  if (!suppressClick) return;
  suppressClick = false;
  e.preventDefault();
  e.stopPropagation();
}, true);

viewport.addEventListener('wheel', (e) => {
  e.preventDefault();
  if (e.ctrlKey || e.metaKey) zoomAt(e.clientX, e.clientY, e.deltaY);
  else {
    cam.x -= e.deltaX || 0;
    cam.y -= e.deltaY;
    apply();
  }
}, { passive: false });

addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const current = route();
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
    if (current === 'index') return;
    e.preventDefault();
    const step = 120;
    if (e.key === 'ArrowLeft') cam.x += step;
    if (e.key === 'ArrowRight') cam.x -= step;
    if (e.key === 'ArrowUp') cam.y += step;
    if (e.key === 'ArrowDown') cam.y -= step;
    apply();
    return;
  }
  if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomCenter(1.1); return; }
  if (e.key === '-' || e.key === '_') { e.preventDefault(); zoomCenter(0.9); return; }
  if (e.key === '0') {
    e.preventDefault();
    location.hash = '';
    frameHome();
    return;
  }
  if (e.key === 'Escape') {
    if (!current) return;
    e.preventDefault();
    if (current.startsWith('work/')) location.hash = 'work';
    else location.hash = '';
    return;
  }
  const jump = { 1: 'work', 2: 'now', 3: 'about', 4: 'contact' }[e.key];
  if (jump) { e.preventDefault(); location.hash = jump; return; }
  if ((e.key === ' ' || e.code === 'Space') && document.activeElement?.matches('a[href^="#"]')) {
    e.preventDefault();
    document.activeElement.click();
  }
});

addEventListener('focusin', (e) => {
  if (route().startsWith('work/')) return;
  const node = e.target.closest?.('[data-x]');
  if (!node || node.id === 'detail-plate' || node.closest('.index-view, .overlay, .bar')) return;
  if (node.classList.contains('sheet')) {
    frameSpot('work', 1.55);
    return;
  }
  frameBox(+node.dataset.x - (+node.dataset.w || 160) / 2, +node.dataset.y - (+node.dataset.h || 120) / 2, +node.dataset.w || 200, +node.dataset.h || 140, 64, 1.55);
});

addEventListener('hashchange', () => sync(true));
addEventListener('resize', () => sync(false));
indexHTML();
place();
sync(false);
