/* GrowEzy page script: the hero photograph's settle, reveal-on-scroll, count-ups and the billing switch.
   Everything is visible without this file and under reduced motion. */
(function () {
  'use strict';
  var root = document.documentElement;
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  requestAnimationFrame(function () { root.classList.add('is-loaded'); });

  /* reveal: each [data-reveal] block fades its children up once, in order */
  var blocks = [].slice.call(document.querySelectorAll('[data-reveal]'));
  if (!still && 'IntersectionObserver' in window && blocks.length) {
    blocks.forEach(function (b) {
      [].forEach.call(b.children, function (c, i) { if (!c.style.getPropertyValue('--i')) c.style.setProperty('--i', i); });
    });
    root.classList.add('rv-on');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });
    blocks.forEach(function (b) { io.observe(b); });
    /* a safety net: nothing stays hidden if the observer never fires */
    setTimeout(function () { blocks.forEach(function (b) { b.classList.add('is-in'); }); }, 6000);
  }

  /* count-ups: a figure ticks from 0 to its own value once, when it is on screen */
  var fmt = new Intl.NumberFormat('en-IN');
  var counts = [].slice.call(document.querySelectorAll('[data-count]'));
  if (!still && 'IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        co.unobserve(e.target);
        var el = e.target, to = +el.getAttribute('data-count'), t0 = null, dur = 1400;
        function step(t) {
          if (t0 === null) t0 = t;
          var k = Math.min(1, (t - t0) / dur), v = Math.round(to * (1 - Math.pow(1 - k, 3)));
          el.textContent = fmt.format(v);
          if (k < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    counts.forEach(function (c) { co.observe(c); });
  }

  /* billing switch: monthly or yearly prices, written in the markup */
  var tabs = [].slice.call(document.querySelectorAll('[data-bill]'));
  var pricing = document.getElementById('pricing');
  function setBill(mode) {
    tabs.forEach(function (t) { t.setAttribute('aria-selected', String(t.getAttribute('data-bill') === mode)); });
    if (pricing) pricing.setAttribute('data-bill-mode', mode);
    document.querySelectorAll('#pricing [data-monthly]').forEach(function (el) {
      var val = el.getAttribute('data-' + mode);
      var target = el.querySelector('.t-stat') || el;
      if (still) { target.textContent = val; return; }
      el.classList.add('is-swapping');
      setTimeout(function () { target.textContent = val; el.classList.remove('is-swapping'); }, 180);
    });
  }
  tabs.forEach(function (t) {
    t.addEventListener('click', function () { setBill(t.getAttribute('data-bill')); });
    t.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      var i = tabs.indexOf(t), n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      n.focus(); setBill(n.getAttribute('data-bill'));
    });
  });
})();

/* FAQ: topic tabs (arrow keys move between them) and one open answer per topic */
(function () {
  'use strict';
  var tabs = [].slice.call(document.querySelectorAll('.fq-tab'));
  if (!tabs.length) return;
  function pick(t, focus) {
    tabs.forEach(function (x) {
      var on = x === t;
      x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1;
      var p = document.getElementById(x.getAttribute('aria-controls'));
      if (p) p.hidden = !on;
    });
    if (focus) t.focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { pick(t); });
    t.addEventListener('keydown', function (e) {
      var k = e.key, n = null;
      if (k === 'ArrowDown' || k === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
      if (k === 'ArrowUp' || k === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
      if (k === 'Home') n = tabs[0];
      if (k === 'End') n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); pick(n, true); }
    });
  });
  document.querySelectorAll('.fq-q').forEach(function (b) {
    b.addEventListener('click', function () {
      var item = b.closest('.fq-item'), open = !item.classList.contains('is-open');
      item.parentNode.querySelectorAll('.fq-item.is-open').forEach(function (o) {
        o.classList.remove('is-open'); o.querySelector('.fq-q').setAttribute('aria-expanded', 'false');
      });
      if (open) { item.classList.add('is-open'); b.setAttribute('aria-expanded', 'true'); }
    });
  });
})();
