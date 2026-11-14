// DomSerwis 365 - drobna interaktywność: menu, pływający pasek, karty sezonu, animacje wejścia.
document.documentElement.classList.add('js');

// menu mobilne
(function () {
  var menu = document.querySelector('.mobile-menu');
  if (!menu) return;
  document.querySelectorAll('[data-menu-open]').forEach(function (b) {
    b.addEventListener('click', function () { menu.classList.add('open'); document.body.style.overflow = 'hidden'; });
  });
  function zamknij() { menu.classList.remove('open'); document.body.style.overflow = ''; }
  menu.querySelectorAll('[data-menu-close], nav a, .mm-cta a').forEach(function (a) { a.addEventListener('click', zamknij); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') zamknij(); });
})();

// pływający pasek: na stronie głównej wjeżdża po zejściu z hero
(function () {
  var nav = document.querySelector('.float-nav');
  var hero = document.querySelector('.hero');
  if (!nav || !hero) return;
  var tick = false;
  function upd() {
    nav.classList.toggle('is-on', window.scrollY > hero.offsetHeight * 0.55);
    tick = false;
  }
  window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
  upd();
})();

// sekcja "sezon w ogrodzie": przełączane karty
(function () {
  var box = document.querySelector('[data-season]');
  if (!box) return;
  var thumbs = box.querySelectorAll('.thumb');
  var imgs = box.querySelectorAll('.stage img');
  var panels = box.querySelectorAll('[data-panel]');
  var licz = box.querySelector('[data-count]');
  var opis = box.querySelector('[data-cap]');
  function pokaz(i) {
    thumbs.forEach(function (t, k) { t.classList.toggle('on', k === i); t.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
    imgs.forEach(function (im, k) { im.classList.toggle('on', k === i); });
    panels.forEach(function (p, k) { p.hidden = k !== i; });
    if (licz) licz.textContent = ('0' + (i + 1)).slice(-2) + ' / ' + ('0' + thumbs.length).slice(-2);
    if (opis) opis.textContent = thumbs[i].getAttribute('data-cap') || '';
  }
  thumbs.forEach(function (t, i) { t.addEventListener('click', function () { pokaz(i); }); });
  pokaz(0);
})();

// animacje wejścia
(function () {
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function (wpisy) {
    wpisy.forEach(function (w) { if (w.isIntersecting) { w.target.classList.add('in'); io.unobserve(w.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  els.forEach(function (el) { io.observe(el); });
  // bezpiecznik: nic nie zostaje niewidoczne (np. zrzut ekranu, druk)
  setTimeout(function () {
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight * 1.2) el.classList.add('in'); });
  }, 1200);
})();

// LICZNIK WAŻNOŚCI DEMA (K. 09.08): wjeżdża po zejściu z pierwszego ekranu.
(function () {
  var el = document.querySelector('.demo-wazne');
  if (!el || !el.getAttribute('data-do')) return;
  var koniec = new Date(el.getAttribute('data-do') + 'T23:59:59');
  if (isNaN(koniec)) return;
  var txt = el.querySelector('.dw-txt') || el;
  var dwa = function (n) { return (n < 10 ? '0' : '') + n; };
  var cykl = parseInt(el.getAttribute('data-cykl') || '0', 10);
  function tyka() {
    var teraz = new Date(), ms = koniec - teraz;
    while (ms <= 0 && cykl > 0) { koniec = new Date(koniec.getTime() + cykl * 86400000); ms = koniec - teraz; }
    if (ms <= 0) { txt.innerHTML = 'Wersja pokazowa wygasła'; el.classList.add('is-koniec'); return false; }
    var s = Math.floor(ms / 1000), d = Math.floor(s / 86400);
    var g = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sek = s % 60;
    var zegar = dwa(g) + ':' + dwa(m) + ':' + dwa(sek);
    txt.innerHTML = d > 0
      ? 'Wersja pokazowa · <b>' + d + ' dni</b> <span class="dw-zeg">' + zegar + '</span>'
      : 'Wersja pokazowa · <b class="dw-pilne">' + zegar + '</b>';
    el.classList.toggle('is-pilne', d === 0);
    return true;
  }
  if (tyka() !== false) setInterval(tyka, 1000);
  el.hidden = false;
  var tick = false;
  function stan() { el.classList.toggle('is-on', (window.scrollY || 0) > window.innerHeight * 0.55); tick = false; }
  window.addEventListener('scroll', function () { if (tick) return; tick = true; requestAnimationFrame(stan); }, { passive: true });
  stan();
})();

// DOLNY PASEK MOBILE: chowa się przy stopce i przy finałowym CTA (te same przyciski)
(function () {
  try {
    var pasek = document.querySelector('.sticky-call');
    if (!pasek || !('IntersectionObserver' in window)) return;
    var cele = document.querySelectorAll('footer, .cta');
    var widoczne = 0;
    var io = new IntersectionObserver(function (wpisy) {
      wpisy.forEach(function (w) { widoczne += w.isIntersecting ? 1 : -1; });
      if (widoczne < 0) widoczne = 0;
      pasek.classList.toggle('schowany', widoczne > 0);
    }, { threshold: 0.01 });
    cele.forEach(function (el) { io.observe(el); });
  } catch (e) {}
})();
