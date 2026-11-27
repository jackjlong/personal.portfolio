import { projects, contact, sections } from '../shared/content.js';

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
  work: { x: 470, y: -8, w: 520, h: 330 },
  contact: { x: 20, y: 320, w: 310, h: 230 },
};

const iconX = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14.7 10.3 21.5 2h-1.6l-5.9 7.2L9.2 2H2.5l7.2 11.1L2.5 22h1.6l6.3-7.7L14.8 22h6.7l-6.8-11.7Zm-2.2 2.7-.7-1.1L4.6 3.3h2.5l4.7 7.1.7 1.1 6.1 9.2h-2.5l-5-7.7Z"/></svg>';
const iconMail = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 6h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Zm9 6.2L19.4 8H4.6L12 12.2ZM4 16.5h16V9.3l-8 4.6-8-4.6v7.2Z"/></svg>';
const iconIn = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.5 9H4V20h2.5V9ZM5.2 3.5a1.6 1.6 0 1 0 .02 3.2 1.6 1.6 0 0 0-.02-3.2ZM20 20h-2.5v-5.6c0-1.6-.6-2.6-2-2.6-1 0-1.6.7-1.9 1.4-.1.2-.1.6-.1.9V20H11V9h2.4v1.5c.4-.7 1.3-1.8 3.2-1.8 2.3 0 4 1.5 4 4.8V20Z"/></svg>';

function contactButtons(withCopy) {
  const mail = `<a class="handle" href="mailto:${esc(contact.email)}">${iconMail}<span>${esc(contact.email)}</span></a>`;
  const copy = withCopy ? `<button type="button" class="handle copy" data-copy="${esc(contact.email)}">Copy</button>` : '';
  return `<a class="handle" href="${esc(contact.x)}">${iconX}<span>X</span></a>
    <div class="email-row">${mail}${copy}</div>
    <a class="handle" href="${esc(contact.linkedin)}">${iconIn}<span>LinkedIn</span></a>`;
}

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
  return `<a class="sheet" data-x="${spots.work.x + (i === 0 ? -120 : 120)}" data-y="${spots.work.y + 40}" data-w="230" data-h="190" href="#work/${esc(p.id)}" id="sheet-${esc(p.id)}" style="--rot:${rot}deg">
      <strong>${esc(p.name)}</strong>
      <span>${esc(p.description)}</span>
    </a>`;
}).join('');

world.innerHTML = `
  <article class="plate home" data-x="0" data-y="0" data-w="340" data-h="268" id="home-card">
    <div class="mark">JL</div>
    <h1>Jack Long</h1>
    <p class="draft">draft copy</p>
    <p class="identity">draft: one line about me</p>
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
    <div class="handles">${contactButtons(false)}</div>
  </article>`;

function place() {
  document.querySelectorAll('.plate').forEach((el) => {
    if (el.id === 'detail-plate') return;
    const w = +el.dataset.w;
    const h = +el.dataset.h || el.offsetHeight || 120;
    el.style.left = `${+el.dataset.x - w / 2}px`;
    el.style.top = `${+el.dataset.y - h / 2}px`;
    if (el.dataset.w) el.style.width = `${w}px`;
    if (el.dataset.h) {
      el.style.minHeight = `${+el.dataset.h}px`;
      el.style.height = `${+el.dataset.h}px`;
    }
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
      <p class="draft">draft copy</p>
      <p class="lede">${esc(project.description)}</p>
      <div class="actions">
        <button type="button" class="primary" data-run="${esc(project.id)}">Run it here</button>
        <a class="secondary" href="${esc(project.live)}" target="_blank" rel="noopener">Live site</a>
        <a class="quiet" href="${esc(project.source)}">Source</a>
      </div>
      <p class="fine">This is the real app. Anything you type stays in your browser.</p>
    </div>
    <div class="screen">
      <img class="poster" src="./assets/posters/${esc(project.id)}.webp" alt="">
      <iframe title="${esc(project.name)}, running live" loading="lazy" hidden></iframe>
    </div>
  </article>`;
}

function nowHTML() {
  const links = projects.map((p) => `<a class="proj" href="#work/${esc(p.id)}"><span aria-hidden="true">▲</span> ${esc(p.name)}</a>`).join('');
  return `<article class="reading note">
    <p class="back-row"><a class="back" href="#">Back</a></p>
    <p class="district-link"><span aria-hidden="true">◆</span> Now</p>
    <p class="draft">draft copy</p>
    <h2>this week</h2>
    <p class="lede">${esc(sections.now)}</p>
    <div class="proj-row">${links}</div>
  </article>`;
}

function aboutHTML() {
  return `<article class="reading note">
    <p class="back-row"><a class="back" href="#">Back</a></p>
    <div class="mark">JL</div>
    <p class="district-link"><span aria-hidden="true">●</span> About</p>
    <p class="draft">draft copy</p>
    <p class="lede">${esc(sections.about)}</p>
    <div class="handles big">${contactButtons(false)}</div>
  </article>`;
}

function contactHTML() {
  return `<article class="reading note contact-detail">
    <p class="back-row"><a class="back" href="#">Back</a></p>
    <p class="district-link"><span aria-hidden="true">■</span> Contact</p>
    <div class="handles big">${contactButtons(true)}</div>
  </article>`;
}

function detailPlate() {
  let plate = document.querySelector('#detail-plate');
  if (!plate) {
    plate = document.createElement('article');
    plate.id = 'detail-plate';
    plate.className = 'detail-plate';
    plate.hidden = true;
    viewport.appendChild(plate);
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
  </div>`;
}

function openSheet(html, spot) {
  const detail = detailPlate();
  detail.hidden = false;
  detail.innerHTML = html;
  const w = Math.min(spot.w + 80, 520);
  const h = Math.min(spot.h + 60, 360);
  return { x: spot.x - w / 2, y: spot.y - h / 2, w, h };
}

function sync() {
  const current = route();
  indexView.hidden = current !== 'index';
  const project = current.startsWith('work/') ? byId[current.slice(5)] : null;
  const detail = detailPlate();
  overlay.hidden = true;
  let frame = null;
  if (project) frame = openSheet(projectHTML(project), spots.work);
  else if (current === 'now') frame = openSheet(nowHTML(), spots.now);
  else if (current === 'about') frame = openSheet(aboutHTML(), spots.about);
  else if (current === 'contact') frame = openSheet(contactHTML(), spots.contact);
  else {
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
  } else if (frame) frameBox(frame.x, frame.y, frame.w, frame.h, 28, 1.55);
  else if (spots[current]) frameSpot(current, 1.55);
  else frameHome();
  const districtOpen = current === 'work' || current === 'now' || current === 'about' || current === 'contact' || current.startsWith('work/');
  document.body.classList.toggle('district-open', districtOpen);
  document.title = (current ? `${current} — ` : '') + 'Atlas — Jack Long';
}

viewport.addEventListener('click', async (e) => {
  const copy = e.target.closest('[data-copy]');
  if (copy) {
    try {
      await navigator.clipboard.writeText(copy.dataset.copy);
      copy.textContent = 'Copied';
    } catch {
      copy.textContent = 'Copy';
    }
    return;
  }
  const run = e.target.closest('[data-run]');
  if (!run) return;
  const project = byId[run.dataset.run];
  const frame = viewport.querySelector('#detail-plate iframe');
  const poster = viewport.querySelector('#detail-plate .poster');
  if (!project || !frame || frame.getAttribute('src')) return;
  frame.hidden = false;
  if (poster) poster.hidden = true;
  frame.src = project.live;
});

document.querySelector('#zoom-in').addEventListener('click', () => zoomCenter(1.1));
document.querySelector('#zoom-out').addEventListener('click', () => zoomCenter(0.9));
document.querySelector('#home').addEventListener('click', () => { location.hash = ''; if (!route()) frameHome(); });

let drag = null;
let suppressClick = false;
viewport.addEventListener('pointerdown', (e) => {
  if (e.button !== 0 || e.target.closest('#detail-plate')) return;
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
  const open = route();
  if (open.startsWith('work/') || open === 'now' || open === 'about' || open === 'contact') return;
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
