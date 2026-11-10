/* GrowEzy product mock-ups: each one comes alive when it is on screen (entrance, counts, a short loop
   showing the real flow) and pauses off screen. Under reduced motion every mock shows its finished state. */
(function () {
  'use strict';
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mocks = [].slice.call(document.querySelectorAll('[data-gx]'));
  var fmt = new Intl.NumberFormat('en-IN');
  if (still || !('IntersectionObserver' in window)) { mocks.forEach(function (m) { m.classList.add('is-live'); }); return; }

  function count(el) {
    var to = +el.getAttribute('data-gx-count'), pre = el.getAttribute('data-gx-prefix') || '', t0 = null;
    el.textContent = pre + '0';
    function step(t) {
      if (t0 === null) t0 = t;
      var k = Math.min(1, (t - t0) / 1300);
      el.textContent = pre + fmt.format(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) requestAnimationFrame(step);
    }
    setTimeout(function () { requestAnimationFrame(step); }, 250);
  }
  function every(ms, fn, host) {
    var id = null;
    host.__start = function () { if (id) return; fn(); id = setInterval(fn, ms); };
    host.__stop = function () { clearInterval(id); id = null; };
  }
  function pop(el, on) { if (!el) return; el.classList.remove('wa-in'); el.style.display = on ? '' : 'none'; if (on) { void el.offsetWidth; el.classList.add('wa-in'); } }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function show(el, on) { if (el) { el.style.transition = 'opacity .45s, transform .45s'; el.style.opacity = on ? '1' : '0'; el.style.transform = on ? 'none' : 'translateY(6px)'; } }

  function setup(m) {
    /* donut segments sweep in */
    m.querySelectorAll('circle.sg').forEach(function (c) {
      var d = c.getAttribute('data-dash'); c.setAttribute('stroke-dasharray', '0 226');
      setTimeout(function () { c.setAttribute('stroke-dasharray', d); }, 300);
    });
    /* team targets fill */
    m.querySelectorAll('.gx-tgt i').forEach(function (b) {
      var k = b.style.getPropertyValue('--k'); b.style.setProperty('--k', '0%');
      setTimeout(function () { b.style.setProperty('--k', k); }, 200);
    });
    m.querySelectorAll('[data-gx-count]').forEach(count);

    /* hero: the reminder toast */
    var toast = m.querySelector('[data-gx-toast]');
    if (toast) every(9000, function () {
      setTimeout(function () { toast.classList.add('is-on'); }, 1400);
      setTimeout(function () { toast.classList.remove('is-on'); }, 6400);
    }, m);

    /* renewals: the reminder is answered, the row turns Renewed, the count goes up */
    var row = m.querySelector('[data-gx-flip]');
    if (row) {
      var pillEl = row.querySelector('.gx-pill'), pendHTML = pillEl.outerHTML;
      var reply = m.querySelector('[data-gx-wa-reply]'), doc = m.querySelector('[data-gx-wa-doc]');
      var renewed = m.querySelector('[data-gx-renewed]');
      every(8000, async function () {
        row.querySelector('.gx-pill').outerHTML = pendHTML;
        row.classList.remove('is-flash'); pop(reply, false); pop(doc, false);
        if (renewed) renewed.textContent = '35';
        await wait(1300); pop(reply, true);
        await wait(1100);
        var p = row.querySelector('.gx-pill');
        p.className = 'gx-pill gx-pill--ren';
        p.innerHTML = '<svg class="fi" viewBox="0 0 24 24" aria-hidden="true"><use href="#fi-okc"/></svg>Renewed';
        row.classList.add('is-flash'); if (renewed) renewed.textContent = '36';
        setTimeout(function () { row.classList.remove('is-flash'); }, 900);
        await wait(900); pop(doc, true);
      }, m);
    }

    /* policy extraction: the ring fills while the steps tick, document by document */
    if (m.hasAttribute('data-gx-proc')) {
      var ring = m.querySelector('[data-gx-ring]'), pct = m.querySelector('[data-gx-pct]'), docN = m.querySelector('[data-gx-doc]');
      var steps = [].slice.call(m.querySelectorAll('.gx-step')), C = 251.3, n = 1;
      every(5200, function () {
        var t0 = null; docN.textContent = n; n = n % 5 + 1;
        function step(t) {
          if (t0 === null) t0 = t;
          var k = Math.min(1, (t - t0) / 4200), v = Math.round(k * 100);
          ring.style.strokeDashoffset = String(C * (1 - k));
          pct.textContent = v;
          var at = Math.min(4, Math.floor(k * 5));
          steps.forEach(function (s, i) { s.classList.toggle('is-done', i < at || k === 1); s.classList.toggle('is-now', i === at && k < 1); });
          if (k < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      }, m);
    }

    /* WhatsApp card: the customer is typing, then replies */
    var typing = m.querySelector('[data-gx-typing]');
    if (typing) {
      var body = typing.parentNode, ans = document.createElement('div');
      ans.className = 'wa-msg wa-msg--in wa-in'; ans.innerHTML = 'YES, please renew it<span class="wa-meta">09:06</span>';
      every(6000, async function () {
        if (ans.parentNode) ans.remove();
        typing.style.display = ''; await wait(2200);
        typing.style.display = 'none'; body.appendChild(ans);
      }, m);
    }

    /* inbox: the policy PDF goes out */
    var tm = m.querySelector('[data-gx-thread-msg]');
    if (tm) every(7000, async function () { show(tm, false); await wait(1600); show(tm, true); }, m);

    /* support AI: thinking, then the answer */
    var answer = m.querySelector('[data-gx-answer]');
    if (answer) {
      var dots = document.createElement('div');
      dots.className = 'gx-typing'; dots.innerHTML = '<i></i><i></i><i></i>'; dots.style.background = '#f4f7e8';
      every(9000, async function () {
        answer.style.display = 'none'; answer.parentNode.insertBefore(dots, answer); dots.style.display = '';
        await wait(1500); dots.style.display = 'none'; answer.style.display = ''; show(answer, false);
        requestAnimationFrame(function () { show(answer, true); });
      }, m);
    }

    /* setup step 3: a reminder rule is switched on */
    var sw = m.querySelector('[data-gx-sw]');
    if (sw) every(3200, function () { sw.classList.toggle('is-on'); }, m);
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var m = e.target;
      if (e.isIntersecting) {
        if (!m.__setup) { m.__setup = true; m.classList.add('is-live'); setup(m); }
        if (m.__start) m.__start();
      } else if (m.__stop) m.__stop();
    });
  }, { threshold: 0.25 });
  mocks.forEach(function (m) { io.observe(m); });
})();
