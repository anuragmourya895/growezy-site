/* GrowEzy Assistant: the website chatbot from the original site (same /api/website-chat endpoint),
   redrawn for the redesign. No API keys in the browser. */
(function () {
  'use strict';
  if (window.__geBotLoaded) return;
  window.__geBotLoaded = true;

  var BASE = (document.currentScript && document.currentScript.src || '').replace(/js\/chatbot\.js.*$/, '') || '';
  var host = location.hostname;
  var local = host === 'localhost' || host === '127.0.0.1' || /\.localhost$/.test(host);
  var ENDPOINT = (window.GrowEzyChatbotConfig && window.GrowEzyChatbotConfig.aiEndpoint) ||
    (local ? 'http://localhost:4000/api/website-chat' : 'https://app.growezy.in/api/website-chat');
  var TIMEOUT = 25000;
  var OPEN_KEY = 'ge_bot_open', SESSION_KEY = 'ge_faq_chat_session', TEASED_KEY = 'ge_bot_teased';
  var WELCOME = 'Hi, I am the GrowEzy Assistant. Ask me about features, pricing, WhatsApp, data security or the free trial.';
  var SUGGEST = ['How much does GrowEzy cost?', 'Is my customer data safe?', 'How does AI read my policy PDFs?', 'How do I start the free trial?'];

  var I = {
    spark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l1.6 4.6L18 9.2l-4.4 1.6L12 15.5l-1.6-4.7L6 9.2l4.4-1.6z" fill="currentColor"/><path d="M18.5 14.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" fill="currentColor"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    reset: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
    send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg>',
    wa: '<img src="' + BASE + 'assets/icons/whatsapp.svg" alt="" width="14" height="14">'
  };

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  /* light markdown: paragraphs, "- " lists, **bold**, [label](url) and bare links */
  function render(text) {
    var out = [], list = null;
    String(text).split(/\n+/).forEach(function (line) {
      var t = line.trim(); if (!t) return;
      var li = /^([-*•]|\d+[.)])\s+/.test(t);
      var html = esc(li ? t.replace(/^([-*•]|\d+[.)])\s+/, '') : t)
        .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
        .replace(/\[([^\]]+)\]\(((?!javascript:|data:)[^)\s]+)\)/gi, function (m, label, url) {
          return '<a href="' + url + '"' + (/^https?:/i.test(url) ? ' target="_blank" rel="noopener"' : '') + '>' + label + '</a>';
        })
        .replace(/(^|\s)(https?:\/\/[^\s<"]+)/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>');
      if (li) { if (!list) { list = []; } list.push('<li>' + html + '</li>'); }
      else { if (list) { out.push('<ul>' + list.join('') + '</ul>'); list = null; } out.push('<p>' + html + '</p>'); }
    });
    if (list) out.push('<ul>' + list.join('') + '</ul>');
    return out.join('');
  }

  function sessionId() {
    try {
      var id = sessionStorage.getItem(SESSION_KEY);
      if (!id) { id = 'ge-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10); sessionStorage.setItem(SESSION_KEY, id); }
      return id;
    } catch (e) { return ''; }
  }

  function build() {
    var root = document.createElement('div');
    root.className = 'gb';
    root.innerHTML =
      '<div class="gb-tease" hidden><button type="button" class="gb-tease__x" aria-label="Dismiss">' + I.close + '</button>' +
        '<b>Questions about GrowEzy?</b><span>Ask our assistant. Answers in seconds.</span></div>' +
      '<button type="button" class="gb-launch" aria-expanded="false" aria-controls="gb-panel">' +
        '<span class="gb-launch__ic">' + I.spark + '</span><span class="gb-launch__t">Ask GrowEzy AI</span>' +
        '<span class="gb-launch__x">' + I.close + '</span></button>' +
      '<section class="gb-panel" id="gb-panel" role="dialog" aria-modal="false" aria-labelledby="gb-title" hidden>' +
        '<header class="gb-head">' +
          '<span class="gb-av"><img src="' + BASE + 'images/growezy-icon.png" alt="" width="22" height="22"></span>' +
          '<div class="gb-head__t"><b id="gb-title">GrowEzy Assistant</b><small><i></i>Online · replies in seconds</small></div>' +
          '<button type="button" class="gb-ib gb-reset" aria-label="Start a new chat" title="New chat">' + I.reset + '</button>' +
          '<button type="button" class="gb-ib gb-close" aria-label="Close chat" title="Close">' + I.close + '</button>' +
        '</header>' +
        '<div class="gb-msgs" aria-live="polite"></div>' +
        '<form class="gb-form" autocomplete="off">' +
          '<label class="gb-sr" for="gb-in">Ask a question</label>' +
          '<input id="gb-in" class="gb-in" type="text" maxlength="500" placeholder="Ask anything about GrowEzy…">' +
          '<button class="gb-send" type="submit" aria-label="Send">' + I.send + '</button>' +
        '</form>' +
        '<footer class="gb-foot"><a href="https://wa.me/918779004488" target="_blank" rel="noopener">' + I.wa + 'Chat with our team</a><span>AI answers can make mistakes</span></footer>' +
      '</section>';
    document.body.appendChild(root);
    return root;
  }

  function init() {
    var root = build();
    var launch = root.querySelector('.gb-launch'), panel = root.querySelector('.gb-panel');
    var msgs = root.querySelector('.gb-msgs'), form = root.querySelector('.gb-form'), input = root.querySelector('.gb-in');
    var tease = root.querySelector('.gb-tease');
    var history = [], busy = false;

    function scroll() { msgs.scrollTop = msgs.scrollHeight; }

    function setOpen(open) {
      root.classList.toggle('is-open', open);
      launch.setAttribute('aria-expanded', String(open));
      launch.setAttribute('aria-label', open ? 'Close GrowEzy Assistant' : 'Open GrowEzy Assistant');
      if (open) { panel.hidden = false; hideTease(); requestAnimationFrame(function () { root.classList.add('is-shown'); }); setTimeout(function () { input.focus(); }, 250); }
      else { root.classList.remove('is-shown'); setTimeout(function () { if (!root.classList.contains('is-open')) panel.hidden = true; }, 260); }
      try { open ? sessionStorage.setItem(OPEN_KEY, '1') : sessionStorage.removeItem(OPEN_KEY); } catch (e) {}
    }

    function add(role, text, isErr) {
      var row = document.createElement('div');
      row.className = 'gb-m gb-m--' + role + (isErr ? ' is-err' : '');
      row.innerHTML = (role === 'bot' ? '<span class="gb-m__av">' + I.spark + '</span>' : '') +
        '<div class="gb-m__b">' + (role === 'bot' ? render(text) : '<p>' + esc(text) + '</p>') + '</div>';
      msgs.appendChild(row); scroll();
      if (!isErr) history.push({ role: role === 'bot' ? 'assistant' : 'user', content: text });
      return row;
    }

    function chips() {
      var wrap = document.createElement('div');
      wrap.className = 'gb-chips';
      SUGGEST.forEach(function (q) {
        var b = document.createElement('button'); b.type = 'button'; b.textContent = q;
        b.addEventListener('click', function () { ask(q); });
        wrap.appendChild(b);
      });
      msgs.appendChild(wrap);
    }

    function typing() {
      var row = document.createElement('div');
      row.className = 'gb-m gb-m--bot';
      row.innerHTML = '<span class="gb-m__av">' + I.spark + '</span><div class="gb-m__b gb-dots" aria-label="Typing"><i></i><i></i><i></i></div>';
      msgs.appendChild(row); scroll();
      return row;
    }

    function request(message) {
      var ctl = window.AbortController ? new AbortController() : null;
      var timer = ctl && setTimeout(function () { ctl.abort(); }, TIMEOUT);
      var headers = { 'Content-Type': 'application/json' }, sid = sessionId();
      if (sid) headers['X-GE-Chat-Session'] = sid;
      return fetch(ENDPOINT, {
        method: 'POST', headers: headers, signal: ctl ? ctl.signal : undefined,
        body: JSON.stringify({ message: message, history: history.slice(-13, -1), surface: 'website', pagePath: location.pathname || '' })
      }).then(function (res) {
        return res.json().catch(function () { return null; }).then(function (data) {
          if (!res.ok || !data || !data.answer) throw new Error((data && data.message) || 'no answer');
          return data.answer;
        });
      }).finally(function () { if (timer) clearTimeout(timer); });
    }

    function ask(text) {
      var q = String(text || '').trim();
      if (!q || busy) return;
      busy = true; form.classList.add('is-busy');
      var c = msgs.querySelector('.gb-chips'); if (c) c.remove();
      add('user', q); input.value = '';
      var t = typing();
      request(q).then(function (answer) { t.remove(); add('bot', answer); })
        .catch(function () {
          t.remove();
          add('bot', 'Sorry, I could not answer that right now. You can [WhatsApp us](https://wa.me/918779004488), call +91 87790 04488 or email support@growezy.in.', true);
        })
        .finally(function () { busy = false; form.classList.remove('is-busy'); input.focus(); });
    }

    function reset() { msgs.innerHTML = ''; history = []; add('bot', WELCOME); chips(); }

    function hideTease() { tease.hidden = true; root.classList.remove('is-teasing'); try { sessionStorage.setItem(TEASED_KEY, '1'); } catch (e) {} }

    launch.addEventListener('click', function () { setOpen(!root.classList.contains('is-open')); });
    root.querySelector('.gb-close').addEventListener('click', function () { setOpen(false); launch.focus(); });
    root.querySelector('.gb-reset').addEventListener('click', reset);
    tease.querySelector('.gb-tease__x').addEventListener('click', function (e) { e.stopPropagation(); hideTease(); });
    tease.addEventListener('click', function () { setOpen(true); });
    form.addEventListener('submit', function (e) { e.preventDefault(); ask(input.value); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('is-open')) { setOpen(false); launch.focus(); } });
    msgs.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]'); if (a && window.innerWidth < 640) setOpen(false);
    });

    reset();
    try {
      if (sessionStorage.getItem(OPEN_KEY) === '1') setOpen(true);
      else if (!sessionStorage.getItem(TEASED_KEY)) setTimeout(function () {
        if (!root.classList.contains('is-open')) { tease.hidden = false; root.classList.add('is-teasing'); }
      }, 6000);
    } catch (e) {}

    document.querySelectorAll('[data-open-chat]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); setOpen(true); });
    });

    window.GrowEzyChatbot = { open: function () { setOpen(true); }, close: function () { setOpen(false); }, ask: function (q) { setOpen(true); ask(q); }, reset: reset };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
