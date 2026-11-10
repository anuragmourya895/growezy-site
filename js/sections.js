/* Compare-every-feature toggle, the contact form (posts to the GrowEzy app), and the pipeline and campaign loops. */
(function () {
  'use strict';
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* compare every feature */
  var cb = document.querySelector('.cmp-btn'), cmp = document.getElementById('compare');
  if (cb && cmp) cb.addEventListener('click', function () {
    var open = cb.getAttribute('aria-expanded') !== 'true';
    cb.setAttribute('aria-expanded', String(open)); cmp.hidden = !open;
    cb.firstChild.textContent = open ? 'Hide comparison ' : 'Compare every feature ';
  });

  /* contact form: the same endpoint the old site used */
  var form = document.getElementById('contact-form');
  if (form) {
    var st = form.querySelector('.cform__st'), btn = form.querySelector('[type="submit"]'), busy = false;
    var host = location.hostname, local = host === 'localhost' || host === '127.0.0.1';
    var endpoint = local ? 'http://localhost:4000/support/website-contact' : 'https://app.growezy.in/support/website-contact';
    function say(t, cls) { st.textContent = t; st.className = 'cform__st' + (cls ? ' ' + cls : ''); }
    form.addEventListener('submit', function (e) {
      e.preventDefault(); if (busy) return;
      var bad = null;
      [].forEach.call(form.querySelectorAll('input[required], select[required], textarea[required]'), function (f) {
        var ok = f.checkValidity(); f.setAttribute('aria-invalid', String(!ok)); if (!ok && !bad) bad = f;
      });
      var mob = form.mobile.value.replace(/\D/g, '').slice(-10);
      if (mob.length !== 10) { form.mobile.setAttribute('aria-invalid', 'true'); bad = bad || form.mobile; }
      if (bad) { say('Please fill in every field. The message needs at least 10 characters.', 'is-err'); bad.focus(); return; }
      var data = { name: form.name.value.trim(), email: form.email.value.trim(), mobile: mob, city: form.city.value.trim(), company: form.company.value.trim(),
        team: form.team.value, interest: form.interest.value, message: form.message.value.trim() };
      if (form.website.value) data.website = form.website.value;
      busy = true; btn.disabled = true; say('Sending…');
      fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json().catch(function () { return {}; }); })
        .then(function () { form.reset(); say('Thank you. Your message reached support@growezy.in and we will reply soon.', 'is-ok'); })
        .catch(function () { say('Could not send right now. Please email support@growezy.in or WhatsApp +91 87790 04488.', 'is-err'); })
        .then(function () { busy = false; btn.disabled = false; });
    });
  }

  if (still || !('IntersectionObserver' in window)) return;

  function onView(el, start, stop) {
    new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? start() : stop(); }); }, { threshold: 0.3 }).observe(el);
  }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /* pipeline: Kavita's quote is won, the task is ticked */
  var pipe = document.querySelector('[data-gx-pipe]');
  if (pipe) {
    var card = pipe.querySelector('[data-gx-move]'), from = pipe.querySelector('[data-gx-from]'), to = pipe.querySelector('[data-gx-to]');
    var qn = pipe.querySelector('[data-gx-qn]'), wn = pipe.querySelector('[data-gx-wn]'), task = pipe.querySelector('[data-gx-task]');
    var home = card.nextSibling, id = null;
    function move(target, before) {
      var a = card.getBoundingClientRect();
      target.insertBefore(card, before || null);
      var b = card.getBoundingClientRect();
      card.style.transition = 'none'; card.style.transform = 'translate(' + (a.left - b.left) + 'px,' + (a.top - b.top) + 'px)';
      requestAnimationFrame(function () { card.style.transition = ''; card.style.transform = ''; });
    }
    async function cycle() {
      await wait(1400);
      move(to, to.children[1]); card.classList.add('is-won');
      card.querySelector('.gx-lc__d').innerHTML = '<svg class="fi" viewBox="0 0 24 24"><use href="#fi-okc"/></svg>Won · policy issued';
      qn.textContent = '7'; wn.textContent = '18'; task.classList.add('is-done');
      await wait(3600);
      move(from, home); card.classList.remove('is-won');
      card.querySelector('.gx-lc__d').innerHTML = '<svg class="fi" viewBox="0 0 24 24"><use href="#fi-clock"/></svg>Follow-up 4 pm';
      card.querySelector('.gx-lc__d').classList.add('is-hot');
      qn.textContent = '8'; wn.textContent = '17'; task.classList.remove('is-done');
    }
    onView(pipe, function () { if (!id) { cycle(); id = setInterval(cycle, 7000); } }, function () { clearInterval(id); id = null; });
  }

  /* leads: the first lead moves Not Contacted -> In progress -> Converted */
  var lr = document.querySelector('[data-gx-lead]');
  if (lr) {
    var cell = lr.children[2], conv = document.querySelector('[data-gx-conv]'), ls = 0, lt = null;
    var states = [['Not Contacted', '#fef3c7', '#b45309', 18], ['In progress', '#f4f7e8', '#5d6c18', 18], ['Converted', '#d1fae5', '#047857', 19]];
    function step() {
      ls = (ls + 1) % states.length; var st = states[ls], pill = cell.querySelector('.gx-ls');
      pill.textContent = st[0]; pill.style.setProperty('--bg', st[1]); pill.style.setProperty('--c', st[2]);
      if (conv) conv.textContent = st[3];
      lr.classList.toggle('is-flash', ls === 2);
    }
    onView(lr.closest('.gx'), function () { if (!lt) lt = setInterval(step, 2200); }, function () { clearInterval(lt); lt = null; });
  }

  /* campaigns: the merge tag fills with one customer after another */
  var camp = document.querySelector('[data-gx-camp]');
  if (camp) {
    var names = ['Meera', 'Ramesh', 'Sunita', 'Faisal', 'Kavita', 'Anil'], k = 0, tid = null;
    var slots = document.querySelectorAll('[data-gx-name]');
    function next() {
      k = (k + 1) % names.length;
      slots.forEach(function (s) { s.style.opacity = '0'; });
      setTimeout(function () { slots.forEach(function (s) { s.textContent = names[k]; s.style.opacity = '1'; }); }, 260);
    }
    onView(camp, function () { if (!tid) tid = setInterval(next, 1800); }, function () { clearInterval(tid); tid = null; });
  }
})();

/* platform tabs: switch on click or arrow keys; advance by themselves every 6 s, paused on hover or focus,
   and stopped for good once the visitor picks a tab */
(function () {
  'use strict';
  var root = document.querySelector('.ptabs'); if (!root) return;
  var tabs = [].slice.call(root.querySelectorAll('.ptab'));
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cur = 0, t0 = 0, held = false, stopped = still, seen = false, DUR = 6000;
  function pick(i, focus) {
    cur = i; t0 = performance.now();
    tabs.forEach(function (t, k) {
      var on = k === i;
      t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; t.style.setProperty('--p', 0);
      var p = document.getElementById(t.getAttribute('aria-controls')); if (p) p.hidden = !on;
    });
    if (focus) tabs[i].focus();
  }
  tabs.forEach(function (t, k) {
    t.addEventListener('click', function (e) { if (e.isTrusted) stopped = true; pick(k); });
    t.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
      if (!d) return; e.preventDefault(); stopped = true; pick((k + d + tabs.length) % tabs.length, true);
    });
  });
  root.addEventListener('pointerenter', function () { held = true; });
  root.addEventListener('pointerleave', function () { held = false; t0 = performance.now() - (parseFloat(tabs[cur].style.getPropertyValue('--p')) || 0) * DUR; });
  root.addEventListener('focusin', function () { held = true; });
  root.addEventListener('focusout', function () { held = false; });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { seen = es[0].isIntersecting; if (seen) t0 = performance.now() - (parseFloat(tabs[cur].style.getPropertyValue('--p')) || 0) * DUR; }, { threshold: 0.35 }).observe(root);
  (function loop(now) {
    if (!stopped && seen && !held) {
      var k = (now - t0) / DUR;
      tabs[cur].style.setProperty('--p', Math.min(1, k).toFixed(3));
      if (k >= 1) pick((cur + 1) % tabs.length);
    } else if (stopped) { tabs[cur].style.setProperty('--p', 1); }
    requestAnimationFrame(loop);
  })(performance.now());
})();

/* setup steps enter one after another */
(function () {
  var g = document.querySelector('[data-stps]'); if (!g) return;
  if (!('IntersectionObserver' in window)) { g.classList.add('is-in'); return; }
  var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { g.classList.add('is-in'); io.disconnect(); } }, { threshold: 0.2 });
  io.observe(g); setTimeout(function () { g.classList.add('is-in'); }, 8000);
})();
