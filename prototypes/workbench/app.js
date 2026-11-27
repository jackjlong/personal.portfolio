import { projects, contact, sections } from '../../shared/content.js';

const scene = document.querySelector('#scene');
const panel = document.querySelector('#panel');
const indexView = document.querySelector('#index');
const motionOff = document.documentElement.classList.contains('motion-off');
const byId = Object.fromEntries(projects.map((p) => [p.id, p]));

const desk = [
  ...projects.map((p, i) => ({
    id: p.id,
    route: `work/${p.id}`,
    kind: p.id === 'subscription-radar' ? 'radar' : 'timecard',
    word: 'work',
    glyph: '▲',
    rot: i === 0 ? -1.4 : 1.1,
    size: 'lg',
  })),
  { id: 'now', route: 'now', kind: 'note', word: 'now', glyph: '◆', rot: -1.6, size: 'sm' },
  { id: 'about', route: 'about', kind: 'badge', word: 'about', glyph: '●', rot: 0.6, size: 'sm' },
  { id: 'contact', route: 'contact', kind: 'envelope', word: 'contact', glyph: '■', rot: 1.2, size: 'sm' },
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
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    const punches = [
      ['9:02', '5:11'], ['8:54', '4:48'], ['9:16', '6:02'], ['9:00', '5:30'],
      ['8:47', '4:55'], ['10:12', '3:40'], ['—', '—'],
    ];
    const cols = days.map((day, i) => `<span class="day"><b>${day}</b><span>in ${punches[i][0]}</span><span>out ${punches[i][1]}</span></span>`).join('');
    return `<span class="notch" aria-hidden="true"></span>
      <span class="name">${esc(project.name)}</span>
      <span class="blurb">${esc(project.description)}</span>
      <span class="week" aria-hidden="true">${cols}</span>`;
  }
  if (item.kind === 'radar') {
    return `<span class="name">${esc(project.name)}</span>
      <span class="blurb">${esc(project.description)}</span>
      <span class="dial" aria-hidden="true">
        <span class="sweep"></span>
        <span class="ring"></span>
        <span class="blip" style="--a:28deg;--d:72px">upcoming</span>
        <span class="blip" style="--a:132deg;--d:88px">average</span>
        <span class="blip" style="--a:220deg;--d:58px">charges</span>
      </span>`;
  }
  if (item.kind === 'note') {
    return `<span class="draft">draft copy</span>
      <span class="note-line">${esc(sections.now)}</span>`;
  }
  if (item.kind === 'badge') {
    return `<span class="clip" aria-hidden="true"></span>
      <span class="mono" aria-hidden="true">JL</span>
      <span class="draft">draft copy</span>
      <span class="note-line">${esc(sections.about)}</span>`;
  }
  return `<span class="flap" aria-hidden="true"></span>
    <span class="who">jack long</span>
    <span class="stamps" aria-hidden="true"><i>X</i><i>@</i><i>in</i></span>
    <span class="label">envelope</span>`;
}

scene.innerHTML = `
  <p class="mast">
    <span class="who">jack long</span>
    <span class="draft">draft copy</span>
    <span class="mast-line">${esc(sections.now)}</span>
  </p>
  <div class="projects">
    ${desk.filter((d) => d.size === 'lg').map(seat).join('')}
  </div>
  <div class="rest">
    ${desk.filter((d) => d.size === 'sm').map(seat).join('')}
  </div>`;

function seat(item) {
  return `<div class="seat ${item.kind}" style="--rot:${item.rot}deg">
    <span class="shade ambient" aria-hidden="true"></span>
    <span class="shade contact" aria-hidden="true"></span>
    <a class="object" id="obj-${item.id}" href="#${item.route}">
      <span class="tab ${item.kind === 'radar' || item.kind === 'timecard' ? 'work' : item.kind === 'note' ? 'now' : item.kind === 'badge' ? 'about' : 'contact'}"><span aria-hidden="true">${item.glyph}</span> ${item.word}</span>
      ${objectBody(item)}
    </a>
  </div>`;
}

function actions(project) {
  return `<div class="actions">
    <button type="button" data-run="${esc(project.id)}">run it here</button>
    <a class="secondary" href="${esc(project.live)}" target="_blank" rel="noopener">live site</a>
    <a class="quiet" href="${esc(project.source)}">source</a>
  </div>
  <p class="fine">this is the real app. anything you type stays in your browser.</p>`;
}

function projectSheet(project) {
  const poster = `./posters/${project.id}.png`;
  return `<div class="layout">
    <div class="copy">
      <p class="tab work"><span aria-hidden="true">▲</span> work</p>
      <h2 id="panel-title" tabindex="-1">${esc(project.name)}</h2>
      <p class="lede">${esc(project.description)}</p>
      ${actions(project)}
    </div>
    <div class="preview">
      <div class="screen">
        <img class="poster" src="${poster}" alt="">
        <iframe title="${esc(project.name)}, running live" loading="lazy" hidden></iframe>
      </div>
    </div>
  </div>`;
}

function workOverview() {
  const cards = projects.map((p) => `
    <a class="mini" href="#work/${esc(p.id)}">
      <span class="tab work"><span aria-hidden="true">▲</span> work</span>
      <span class="name">${esc(p.name)}</span>
      <span class="lede">${esc(p.description)}</span>
    </a>`).join('');
  return `<h2 id="panel-title" tabindex="-1">work</h2>
    <p class="lede">two small tools. both run in the browser.</p>
    <div class="cards">${cards}</div>`;
}

function sheetHTML(current) {
  const back = `<div class="sheet-bar"><a href="#">back to the desk</a></div>`;
  if (current.startsWith('work/')) {
    const project = byId[current.slice(5)];
    if (!project) return '';
    return `<article class="sheet">${back}${projectSheet(project)}</article>`;
  }
  if (current === 'work') return `<article class="sheet">${back}${workOverview()}</article>`;
  if (current === 'now') {
    return `<article class="sheet sheet-plain">${back}
      <div class="plain">
        <p class="tab now"><span aria-hidden="true">◆</span> now</p>
        <h2 id="panel-title" tabindex="-1">now</h2>
        <p class="draft">draft copy</p>
        <p class="lede big">${esc(sections.now)}</p>
      </div>
    </article>`;
  }
  if (current === 'about') {
    return `<article class="sheet sheet-plain">${back}
      <div class="plain">
        <p class="tab about"><span aria-hidden="true">●</span> about</p>
        <h2 id="panel-title" tabindex="-1">about</h2>
        <p class="draft">draft copy</p>
        <p class="lede big">${esc(sections.about)}</p>
      </div>
    </article>`;
  }
  if (current === 'contact') {
    return `<article class="sheet sheet-plain">${back}
      <div class="plain">
        <p class="tab contact"><span aria-hidden="true">■</span> contact</p>
        <h2 id="panel-title" tabindex="-1">contact</h2>
        <div class="stamps-open">
          <a class="stamp" href="${esc(contact.x)}"><span>X</span>X</a>
          <a class="stamp" href="mailto:${esc(contact.email)}"><span>email</span>${esc(contact.email)}</a>
          <a class="stamp" href="${esc(contact.linkedin)}"><span>LinkedIn</span>LinkedIn</a>
        </div>
      </div>
    </article>`;
  }
  return '';
}

function indexHTML() {
  const items = projects.map((p) => `<li>
      <a href="#work/${esc(p.id)}">${esc(p.name)}</a> — ${esc(p.description)}
      <a href="${esc(p.live)}">live</a>
      <a href="${esc(p.source)}">source</a>
    </li>`).join('');
  indexView.innerHTML = `<div class="wrap">
    <p><a href="#">back to the desk</a></p>
    <h1>index</h1>
    <h2>▲ work</h2><ul>${items}</ul>
    <h2>◆ now</h2>
    <p><a href="#now">now</a> — <span class="draft">draft copy</span> ${esc(sections.now)}</p>
    <h2>● about</h2>
    <p><a href="#about">about</a> — <span class="draft">draft copy</span> ${esc(sections.about)}</p>
    <h2>■ contact</h2>
    <ul>
      <li><a href="${esc(contact.x)}">X</a></li>
      <li><a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a></li>
      <li><a href="${esc(contact.linkedin)}">LinkedIn</a></li>
    </ul>
    <p><a href="../../">all concepts</a></p>
  </div>`;
}

function anchorId(current) {
  if (current.startsWith('work/')) return `obj-${current.slice(5)}`;
  if (current === 'work') return 'obj-shiftme';
  if (current === 'index') return 'index-link';
  return `obj-${current}`;
}

function flyFrom(card, sheet) {
  const rest = 'rotateX(16deg)';
  if (!sheet) return;
  if (motionOff || !card) {
    sheet.style.transition = 'none';
    sheet.style.transform = rest;
    return;
  }
  const from = card.getBoundingClientRect();
  const to = sheet.getBoundingClientRect();
  const dx = from.left + from.width / 2 - (to.left + to.width / 2);
  const dy = from.top + from.height / 2 - (to.top + to.height / 2);
  const s = Math.max(0.2, Math.min(from.width / to.width, from.height / to.height));
  sheet.style.transition = 'none';
  sheet.style.transform = `translate(${dx}px, ${dy}px) scale(${s}) rotateX(50deg)`;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      sheet.style.transition = 'transform .62s cubic-bezier(.16, .84, .24, 1)';
      sheet.style.transform = rest;
    });
  });
}

function bindTilt(el) {
  const seatEl = el.parentElement;
  const rest = () => {
    el.style.transform = '';
    seatEl.classList.remove('lifted');
  };
  if (motionOff) {
    el.addEventListener('pointerenter', () => seatEl.classList.add('lifted'));
    el.addEventListener('pointerleave', rest);
    el.addEventListener('focus', () => seatEl.classList.add('lifted'));
    el.addEventListener('blur', rest);
    return;
  }
  const tilt = (clientX, clientY) => {
    const r = el.getBoundingClientRect();
    const px = (clientX - (r.left + r.width / 2)) / (r.width / 2);
    const py = (clientY - (r.top + r.height / 2)) / (r.height / 2);
    const ry = Math.max(-6, Math.min(6, px * 6));
    const rx = Math.max(-6, Math.min(6, -py * 6));
    el.style.transform = `rotateZ(var(--rot)) translateZ(42px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    seatEl.classList.add('lifted');
  };
  el.addEventListener('pointermove', (e) => tilt(e.clientX, e.clientY));
  el.addEventListener('pointerleave', rest);
  el.addEventListener('focus', () => {
    el.style.transform = 'rotateZ(var(--rot)) translateZ(42px) rotateX(4deg)';
    seatEl.classList.add('lifted');
  });
  el.addEventListener('blur', rest);
}

scene.querySelectorAll('.object').forEach(bindTilt);

let booted = false;
let returnFocus = null;

function sync(fromUser) {
  const current = route();
  indexView.hidden = current !== 'index';
  const html = sheetHTML(current);
  const open = Boolean(html);
  panel.hidden = !open;
  panel.innerHTML = html;
  document.querySelector('.room').classList.toggle('dim', open);
  document.querySelectorAll('.paths a').forEach((a) => {
    const href = a.getAttribute('href').slice(1);
    const on = current === href || current.startsWith(`${href}/`);
    if (on) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  document.title = (current ? `${current} — ` : '') + 'Workbench — Jack Long';
  if (open) flyFrom(document.getElementById(anchorId(current)), panel.querySelector('.sheet'));
  if (booted && fromUser !== false && open) panel.querySelector('.sheet-bar a')?.focus();
  booted = true;
}

panel.addEventListener('click', (e) => {
  const run = e.target.closest('[data-run]');
  if (!run) return;
  const project = byId[run.dataset.run];
  const frame = panel.querySelector('iframe');
  const poster = panel.querySelector('.poster');
  if (!project || !frame || frame.getAttribute('src')) return;
  frame.hidden = false;
  if (poster) poster.hidden = true;
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
    const back = returnFocus || anchorId(current);
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
