/* Premium motion layer: scroll progress, glass nav, hero aurora and pointer light, word-by-word headlines,
   the hero window standing up in perspective, card lights and tilt, magnetic hero buttons, curtain photographs,
   a parallax close photo, the ticker and the FAQ's sliding pill. Rests under reduced motion. */
(function () {
  'use strict';
  var root = document.documentElement;
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };

  /* the ticker and the hero decor are markup either way */
  var hero = $('.hero--centred');
  if (hero) {
    var au = document.createElement('div'); au.className = 'px-aurora'; au.setAttribute('aria-hidden', 'true'); au.innerHTML = '<i></i><i></i><i></i>';
    var sp = document.createElement('div'); sp.className = 'px-spot'; sp.setAttribute('aria-hidden', 'true');
    hero.prepend(sp); hero.prepend(au);
  }
  /* the same drifting light behind every page, fixed to the screen */
  var pa = document.createElement('div'); pa.className = 'px-aurora px-aurora--page'; pa.setAttribute('aria-hidden', 'true');
  pa.innerHTML = '<i></i><i></i><i></i><i></i>'; document.body.prepend(pa);
  var band = $('#statement');
  if (band) {
    var words = ['Renewal reminders', 'Policy PDFs read by AI', 'Commission tracking', 'WhatsApp Business inbox', 'Renewal reconciliation', 'Leads and quotes', 'Claims', 'Team targets', 'Unlimited agency codes', 'Support AI'];
    var row = words.map(function (w) { return '<span>' + w + '</span>'; }).join('');
    var tk = document.createElement('div'); tk.className = 'px-ticker'; tk.setAttribute('aria-hidden', 'true');
    tk.innerHTML = '<div class="px-ticker__t">' + row + row + '</div>';
    band.appendChild(tk);
  }
  if (still) return;
  root.classList.add('px-on');

  /* progress bar and glass nav */
  var bar = document.createElement('div'); bar.className = 'px-progress'; bar.setAttribute('aria-hidden', 'true'); document.body.appendChild(bar);
  var nav = $('header.nav'), win = hero && $('.hero__window', hero), ticking = false;
  function onScroll() {
    var y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    if (nav) nav.classList.toggle('px-glass', y > 8);
    if (win && win.classList.contains('px-shown')) {
      var k = Math.min(1, y / (innerHeight * 0.55));
      win.style.setProperty('--px-tilt', (14 * (1 - k)).toFixed(2) + 'deg');
      win.style.setProperty('--px-sc', (0.94 + 0.06 * k).toFixed(4));
    }
    var cm = $('.close__media > img');
    if (cm) {
      var r = cm.parentNode.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) cm.style.transform = 'translateY(' + ((r.top + r.height / 2 - innerHeight / 2) * -0.08).toFixed(1) + 'px) scale(1.12)';
    }
    ticking = false;
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);

  /* hero window: in from below, lying back, then stands up with the scroll */
  if (win) {
    win.classList.add('px-enter');
    setTimeout(function () { win.classList.add('px-shown'); onScroll(); }, 350);
    setTimeout(function () { win.classList.remove('px-enter'); }, 2200);
  }

  /* split headlines into words (child spans such as the grey run-on are kept) */
  function split(el) {
    var i = 0;
    (function walk(node) {
      [].slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var parts = n.textContent.split(/(\s+)/), frag = document.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
            var w = document.createElement('span'); w.className = 'px-w';
            var inner = document.createElement('span'); inner.textContent = p; inner.style.setProperty('--wi', i++);
            w.appendChild(inner); frag.appendChild(w);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && !n.classList.contains('px-w')) walk(n);
      });
    })(el);
    if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    el.classList.add('px-split');
  }
  var heads = $$('main h1, main section > .wrap h2, footer.closing h2').filter(function (h) { return !h.classList.contains('mo-lt__type'); });
  heads.forEach(split);
  var h1 = $('main h1');
  if (h1) setTimeout(function () { h1.classList.add('px-in'); }, 120);

  /* curtain photographs */
  $$('#advisors .tile__media, .close__media').forEach(function (m) { m.classList.add('px-reveal'); });

  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('px-in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });
  heads.forEach(function (h) { if (h !== h1) io.observe(h); });
  $$('.px-reveal').forEach(function (m) { io.observe(m); });
  setTimeout(function () { heads.concat($$('.px-reveal')).forEach(function (x) { x.classList.add('px-in'); }); }, 9000);

  /* FAQ: the pill under the chosen topic slides */
  var ft = $('.fq-tabs');
  if (ft) {
    var ind = document.createElement('span'); ind.className = 'fq-ind'; ind.setAttribute('aria-hidden', 'true');
    ft.prepend(ind); ft.classList.add('px-has-ind');
    var place = function () {
      var t = $('.fq-tab[aria-selected="true"]', ft); if (!t) return;
      ind.style.transform = 'translateY(' + t.offsetTop + 'px)'; ind.style.height = t.offsetHeight + 'px'; ind.style.width = t.offsetWidth + 'px';
    };
    $$('.fq-tab', ft).forEach(function (t) { t.addEventListener('click', function () { requestAnimationFrame(place); }); t.addEventListener('keydown', function () { requestAnimationFrame(place); }); });
    addEventListener('resize', place); place(); setTimeout(place, 600);
  }

  onScroll();
  if (!fine) return;

  /* hero pointer light */
  if (hero) hero.addEventListener('pointermove', function (e) {
    var r = hero.getBoundingClientRect();
    hero.style.setProperty('--hx', (e.clientX - r.left) + 'px'); hero.style.setProperty('--hy', (e.clientY - r.top) + 'px');
  });

  /* card lights, and a small 3D tilt on the plans */
  $$('.pcard, .panel--gx, #advisors .tile__media, .frame--gx').forEach(function (c) {
    c.classList.add('px-glow');
    var plan = c.classList.contains('pcard');
    c.addEventListener('pointermove', function (e) {
      var r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      c.style.setProperty('--mx', x + 'px'); c.style.setProperty('--my', y + 'px');
      if (plan) {
        var rx = ((y / r.height) - .5) * -5, ry = ((x / r.width) - .5) * 6;
        c.style.transform = 'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-4px)';
        c.classList.add('px-tilting');
      }
    });
    c.addEventListener('pointerleave', function () { if (plan) { c.style.transform = ''; c.classList.remove('px-tilting'); } });
  });

  /* magnetic hero buttons */
  $$('.hero .btn, .closing__cta .btn').forEach(function (b) {
    b.classList.add('px-mag');
    b.addEventListener('pointermove', function (e) {
      var r = b.getBoundingClientRect();
      b.style.translate = ((e.clientX - r.left - r.width / 2) * .18).toFixed(1) + 'px ' + ((e.clientY - r.top - r.height / 2) * .28).toFixed(1) + 'px';
    });
    b.addEventListener('pointerleave', function () { b.style.translate = ''; });
  });
})();
