(() => {
  const D = window.IZZY;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => 1 - Math.pow(1 - t, 3);
  const fmt = s => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- sol da capa: raios gerados uma vez no símbolo ---------- */
  (() => {
    const n = 22; let d = '';
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2, w = Math.PI / n * .55;
      const p = (r, t) => (Math.cos(t) * r).toFixed(2) + ' ' + (Math.sin(t) * r).toFixed(2);
      d += `M${p(25, a - w)}L${p(47, a)}L${p(25, a + w)}Z`;
    }
    $('#sun .sun__rays').setAttribute('d', d);
  })();

  /* ---------- intro: semente, raiz, nome ---------- */
  const root = document.documentElement;
  if (root.classList.contains('intro-on')) {
    const intro = $('#intro'), name = $('#introName');
    name.innerHTML = [...name.textContent].map((c, i) =>
      c === ' ' ? ' ' : `<span style="animation-delay:${1.1 + i * .06}s">${c}</span>`).join('');
    const freeze = new URLSearchParams(location.search).get('intro');
    let done = false;
    const end = () => {
      if (done) return; done = true;
      try { sessionStorage.setItem('izzyIntro', '1'); } catch (e) {}
      intro.classList.add('out');
      setTimeout(() => root.classList.remove('intro-on'), 900);
    };
    intro.addEventListener('click', end);
    addEventListener('keydown', end, { once: true });
    if (!(freeze && /^\d+$/.test(freeze))) setTimeout(end, reduce ? 300 : 3000);
  }

  /* ---------- header ---------- */
  const hd = $('#hd'), menuBtn = $('#menuBtn');
  menuBtn.addEventListener('click', () => {
    const o = hd.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', o);
    document.body.style.overflow = o ? 'hidden' : '';
  });
  $$('#nav a').forEach(a => a.addEventListener('click', () => {
    hd.classList.remove('open'); menuBtn.setAttribute('aria-expanded', false); document.body.style.overflow = '';
  }));
  const zones = $$('[data-hd]');

  /* ---------- hero ---------- */
  const hero = $('.hero'), stick = $('.hero__stick'), win = $('#heroWin'), frame = $('#heroFrame');
  const fp = $$('polygon', frame), imgA = $('#heroA'), tri = $('#heroTri'), triV = $$('video', tri);
  let triOn = false, reelI = 0;
  // uma tela só: os vídeos ao vivo se revezam, um de cada vez
  function reelPlay() {
    triV.forEach((v, i) => v.classList.toggle('on', i === reelI));
    const v = triV[reelI]; v.currentTime = 0; v.play().catch(() => {});
  }
  triV.forEach((v, i) => v.addEventListener('ended', () => {
    if (!triOn || i !== reelI) return;
    reelI = (reelI + 1) % triV.length;
    triV[reelI].preload = 'auto';
    reelPlay();
  }));
  const giantL = $('.hero__giant--l'), giantR = $('.hero__giant--r');
  const copy = $('.hero__copy'), cta = $('.hero__cta'), after = $('#heroAfter'), suns = $('.hero__suns'), scrollCue = $('.hero__scroll');

  function heroFrame(p) {
    const w = stick.clientWidth, h = stick.clientHeight, mob = w < 640;
    const cx = w / 2, cy = h * (mob ? .4 : .47);
    const r = mob ? Math.min(w * .36, h * .24) : Math.min(w * .3, h * .36);
    const e = ease(clamp((p - .06) / .5));
    const Dm = [[cx, cy - r], [cx + r, cy], [cx, cy + r], [cx - r, cy]];
    const F = [[0, 0], [w, 0], [w, h], [0, h]];
    const P = Dm.map((d, i) => [d[0] + (F[i][0] - d[0]) * e, d[1] + (F[i][1] - d[1]) * e]);
    win.style.clipPath = `polygon(${P.map(q => q[0].toFixed(1) + 'px ' + q[1].toFixed(1) + 'px').join(',')})`;
    const mx = P.reduce((s, q) => s + q[0], 0) / 4, my = P.reduce((s, q) => s + q[1], 0) / 4;
    [10, 22, 34].forEach((off, k) => {
      const pts = P.map(q => {
        const dx = q[0] - mx, dy = q[1] - my, L = Math.hypot(dx, dy) || 1;
        return (q[0] + dx / L * off).toFixed(1) + ',' + (q[1] + dy / L * off).toFixed(1);
      }).join(' ');
      fp[k].setAttribute('points', pts);
    });
    frame.style.opacity = 1 - clamp((e - .55) / .35);
    // o retrato fica do tamanho do losango (sem ampliar a foto) e cresce junto até ceder lugar ao tríptico
    const box = r * 2 * (1 + e * .35);
    Object.assign(imgA.style, { left: cx - box / 2 + 'px', top: cy - box / 2 + 'px', width: box + 'px', height: box + 'px' });
    imgA.style.opacity = 1 - clamp((p - .32) / .1);
    const tv = clamp((p - .3) / .1);
    tri.style.opacity = tv;
    if ((tv > 0) !== triOn) { triOn = tv > 0; triOn ? reelPlay() : triV.forEach(v => v.pause()); }
    win.style.setProperty('--shade', clamp((p - .45) / .15));
    const fadeOut = 1 - clamp((p - .12) / .16);
    copy.style.opacity = cta.style.opacity = fadeOut;
    cta.style.pointerEvents = fadeOut < .2 ? 'none' : '';
    scrollCue.style.opacity = .55 * (1 - clamp(p / .08));
    suns.style.opacity = 1 - clamp((p - .1) / .3);
    giantL.style.transform = `translateX(${-p * 40}vw)`;
    giantR.style.transform = `translateX(${p * 40}vw)`;
    const a = clamp((p - .6) / .14);
    after.style.opacity = a;
    after.style.transform = `translateY(${(1 - a) * 40}px)`;
  }
  if (matchMedia('(pointer:fine)').matches) {
    hero.addEventListener('pointermove', e => {
      suns.style.setProperty('--mx', (e.clientX / innerWidth - .5) * 2);
      suns.style.setProperty('--my', (e.clientY / innerHeight - .5) * 2);
    });
  }

  /* ---------- manifesto palavra por palavra ---------- */
  const mani = $('#maniText');
  const hl = ['samba,', 'memória', 'ancestralidade,'];
  mani.innerHTML = mani.textContent.trim().split(/\s+/).map(w =>
    `<span class="w${hl.includes(w) ? ' hl' : ''}">${w}</span>`).join(' ');
  const words = $$('.w', mani);

  /* ---------- raiz desenhada no scroll ---------- */
  const rootPath = $('#rootPath'), tree = $('.roots__tree');
  rootPath.setAttribute('pathLength', '1');
  rootPath.style.strokeDasharray = '1';

  /* ---------- faixas de Sementes ---------- */
  const byId = {};
  D.sementes.tracks.forEach((t, i) => byId[t.id] = { t: t.t, s: 'Sementes da Tamarineira', c: D.sementes.cover });
  D.singles.forEach(s => byId[s.id] = { t: s.t, s: s.f === 'single' ? 'Single · ' + s.y : s.f, c: s.c });
  D.albums.forEach(a => a.tracks.forEach(t => byId[t.id] = byId[t.id] || { t: t.t, s: a.t, c: a.c }));

  $('#tracks').innerHTML = D.sementes.tracks.map(t => `
    <li><button class="tr" data-id="${t.id}"><span class="tr__t">${t.t}</span><span class="tr__d">${fmt(t.d)}</span><span class="tr__p"></span><span class="tr__bar"></span></button></li>`).join('');

  $('#shelf').innerHTML = D.singles.map(s => `
    <article class="sg" data-id="${s.id}">
      <button class="sg__art" data-id="${s.id}" aria-label="Ouvir prévia de ${s.t}">
        <span class="sg__vinyl"></span><img src="${s.c}" alt="" loading="lazy" draggable="false"><span class="sg__play"></span>
      </button>
      <p class="sg__t">${s.t}</p>
      <p class="sg__f">${s.f === 'single' ? 'Single' : s.f}</p>
      <p class="sg__y"><span>${s.y}</span><a href="${s.u}" target="_blank" rel="noopener">Ouvir completo</a></p>
    </article>`).join('');

  $('#records').innerHTML = D.albums.map(a => `
    <article class="rec">
      <div class="rec__sleeve" tabindex="0">
        <span class="rec__disc"></span>
        ${a.c ? `<img src="${a.c}" alt="Capa de ${a.t}" loading="lazy">` : `<div class="rec__type"><b>${a.t}</b><span>${a.s}</span></div>`}
      </div>
      <p class="rec__y">${a.y}</p>
      <h3 class="rec__t">${a.t}</h3>
      <p class="rec__s">${a.s}</p>
      ${a.tracks.length ? `<ul class="rec__tracks">${a.tracks.map(t => `<li><button data-id="${t.id}">${t.t}</button></li>`).join('')}</ul>` : ''}
      ${a.u ? `<a class="rec__u" href="${a.u}" target="_blank" rel="noopener">Ouvir o álbum</a>` : ''}
    </article>`).join('');

  /* ---------- player com sol que reage à voz ---------- */
  const audio = $('#audio'), player = $('#player'), cv = $('#sunCanvas'), cx2 = cv.getContext('2d');
  let actx, analyser, bins, cur = null;
  function setupAudio() {
    if (actx) return;
    try {
      actx = new (window.AudioContext || window.webkitAudioContext)();
      const src = actx.createMediaElementSource(audio);
      analyser = actx.createAnalyser(); analyser.fftSize = 128; analyser.smoothingTimeConstant = .8;
      bins = new Uint8Array(analyser.frequencyBinCount);
      src.connect(analyser); analyser.connect(actx.destination);
    } catch (e) { actx = null; }
  }
  function mark() {
    $$('[data-id]').forEach(el => el.classList.toggle('on', !audio.paused && String(cur) === el.dataset.id));
    player.classList.toggle('on', !audio.paused);
    $('#pToggle').setAttribute('aria-label', audio.paused ? 'Tocar' : 'Pausar');
  }
  function play(id) {
    id = String(id);
    if (cur === id) { audio.paused ? audio.play() : audio.pause(); return; }
    const t = byId[id]; if (!t) return;
    setupAudio(); if (actx && actx.state === 'suspended') actx.resume();
    stopClip();
    cur = id; audio.src = `audio/${id}.mp3`; audio.play().catch(() => {});
    $('#pTitle').textContent = t.t; $('#pSub').textContent = t.s + ' · prévia';
    $('#pCover').src = t.c || D.sementes.cover;
    player.hidden = false;
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('button[data-id]');
    if (b && !shelfDragged) { play(b.dataset.id); return; }
    const h = e.target.closest('[data-play]');
    if (h) { const [k, i] = h.dataset.play.split(':'); play(D[k].tracks[+i].id); }
  });
  audio.addEventListener('play', mark); audio.addEventListener('pause', mark);
  audio.addEventListener('ended', () => {
    const list = D.sementes.tracks.map(t => String(t.id)), i = list.indexOf(cur);
    if (i > -1 && i < list.length - 1) play(list[i + 1]); else mark();
  });
  $('#pToggle').addEventListener('click', () => audio.paused ? audio.play() : audio.pause());
  $('#pClose').addEventListener('click', () => { audio.pause(); player.hidden = true; cur = null; mark(); });

  function drawSun() {
    const W = cv.width, c = W / 2;
    cx2.clearRect(0, 0, W, W);
    if (player.hidden) return;
    let lv = new Array(24).fill(0);
    if (analyser && !audio.paused) {
      analyser.getByteFrequencyData(bins);
      lv = lv.map((_, i) => bins[2 + i] / 255);
    }
    const t = performance.now() / 4000;
    cx2.fillStyle = '#d39a3a';
    for (let i = 0; i < 24; i++) {
      const a = t + i / 24 * Math.PI * 2, w = Math.PI / 24 * .6, r0 = 30, r1 = 36 + lv[i] * 24;
      cx2.beginPath();
      cx2.moveTo(c + Math.cos(a - w) * r0, c + Math.sin(a - w) * r0);
      cx2.lineTo(c + Math.cos(a) * r1, c + Math.sin(a) * r1);
      cx2.lineTo(c + Math.cos(a + w) * r0, c + Math.sin(a + w) * r0);
      cx2.fill();
    }
    $$('.tr.on .tr__bar').forEach(b => b.style.width = (audio.currentTime / (audio.duration || 30) * 100) + '%');
    $('#pBar').style.width = (audio.currentTime / (audio.duration || 30) * 100) + '%';
  }

  /* ---------- At Last com som ---------- */
  const clip = $('#atLast'), clipFull = $('.clip__full', clip);
  function stopClip() { if (!clipFull.paused) clipFull.pause(); clip.classList.remove('playing'); }
  $('.clip__btn', clip).addEventListener('click', () => {
    if (clip.classList.contains('playing')) { stopClip(); return; }
    audio.pause();
    if (!clipFull.src) clipFull.src = clipFull.dataset.src;
    clipFull.currentTime = 0; clipFull.play().catch(() => {});
    clip.classList.add('playing');
  });
  clipFull.addEventListener('ended', stopClip);

  /* ---------- vídeos: carregam perto da tela, pausam fora ---------- */
  const vio = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target;
    if (e.isIntersecting) { if (!v.src && v.dataset.src) v.src = v.dataset.src; v.play().catch(() => {}); }
    else v.pause();
  }), { rootMargin: '200px' });
  $$('video[data-auto]').forEach(v => vio.observe(v));

  /* ---------- reveals ---------- */
  $$('.roots__head,.music__head,.stage__head,.agenda__head,.disco__head,.seeds__txt,.queens__txt,.gig,.past,.trilogy,.hire__txt,.build,.rec,.sg').forEach(el => el.classList.add('rv'));
  const rio = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); }
  }), { rootMargin: '0px 0px -12% 0px' });
  $$('.rv,.node').forEach(el => rio.observe(el));

  /* ---------- capa com inclinação ---------- */
  const cover = $('#cover');
  if (matchMedia('(pointer:fine)').matches) {
    cover.addEventListener('pointermove', e => {
      const r = cover.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      cover.style.setProperty('--ry', (x - .5) * 14 + 'deg'); cover.style.setProperty('--rx', (.5 - y) * 14 + 'deg');
      cover.style.setProperty('--sx', x * 100 + '%'); cover.style.setProperty('--sy', y * 100 + '%');
    });
    cover.addEventListener('pointerleave', () => { cover.style.setProperty('--ry', '0deg'); cover.style.setProperty('--rx', '0deg'); });
  }

  /* ---------- prateleira arrastável ---------- */
  const shelf = $('#shelf'); let shelfDragged = false;
  shelf.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse') return;
    const x0 = e.clientX, s0 = shelf.scrollLeft; shelfDragged = false;
    const mv = ev => { const dx = ev.clientX - x0; if (Math.abs(dx) > 5) { shelfDragged = true; shelf.classList.add('drag'); } shelf.scrollLeft = s0 - dx; };
    const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); shelf.classList.remove('drag'); setTimeout(() => shelfDragged = false, 0); };
    addEventListener('pointermove', mv); addEventListener('pointerup', up);
  });

  /* ---------- pedido de show pro WhatsApp ---------- */
  const form = $('#build'), note = $('#showNote');
  const setNote = () => note.textContent = D.shows[form.show.value] || '';
  form.addEventListener('change', setNote); setNote();
  form.addEventListener('submit', e => {
    e.preventDefault();
    const f = form, dt = f.data.value ? f.data.value.split('-').reverse().join('/') : 'a combinar';
    const msg = `Olá! ${f.nome.value ? 'Sou ' + f.nome.value.trim() + ' e g' : 'G'}ostaria de contratar a Izzy Gordon.\n\nShow: ${f.show.value}\nEvento: ${f.tipo.value}\nCidade: ${f.cidade.value.trim() || 'a definir'}\nData: ${dt}\n\nPodemos conversar?`;
    window.open('https://wa.me/5511959328780?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  });

  /* ---------- um único loop de scroll ---------- */
  const mosaic = $$('.m[data-speed]'), crown = $('.queens__crown'), maniSec = $('.mani');
  let lastY = scrollY;
  function tick() {
    const y = scrollY, vh = innerHeight;
    // hero
    const hr = hero.getBoundingClientRect();
    if (hr.bottom > 0) heroFrame(clamp(-hr.top / (hr.height - vh)));
    // header
    const probe = 30;
    const z = zones.find(s => { const r = s.getBoundingClientRect(); return r.top <= probe && r.bottom > probe; });
    hd.classList.toggle('light', !!z && z.dataset.hd === 'light' && !hd.classList.contains('open'));
    hd.classList.toggle('scrolled', y > 40 && hr.bottom < vh * .2);
    if (!hd.classList.contains('open')) hd.classList.toggle('hide', y > lastY && y > vh && y - lastY > 2);
    lastY = y;
    // manifesto
    const mr = maniSec.getBoundingClientRect();
    if (mr.top < vh && mr.bottom > 0) {
      const p = clamp((vh * .85 - mr.top) / (mr.height * .75));
      const n = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle('on', i < n));
    }
    // raiz
    const tr = tree.getBoundingClientRect();
    if (tr.top < vh && tr.bottom > 0) rootPath.style.strokeDashoffset = 1 - clamp((vh * .6 - tr.top) / tr.height);
    // mosaico
    mosaic.forEach(m => {
      const r = m.parentElement.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0 && innerWidth > 640) m.style.transform = `translateY(${(r.top + r.height / 2 - vh / 2) * +m.dataset.speed}px)`;
    });
    // coroa
    const cr = crown.getBoundingClientRect();
    if (cr.top < vh && cr.bottom > 0) crown.style.setProperty('--cx', (cr.top - vh) * .4 + 'px');
    drawSun();
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
