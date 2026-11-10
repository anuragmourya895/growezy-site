/* Inner pages: reading time and the table of contents that follows the scroll. */
(function () {
  'use strict';
  var doc = document.querySelector('[data-doc]');
  if (!doc) return;
  var rt = document.querySelector('[data-readtime]');
  if (rt) rt.textContent = Math.max(1, Math.round(doc.textContent.split(/\s+/).length / 220)) + ' min read';
  var links = [].slice.call(document.querySelectorAll('.lg-toc a'));
  var heads = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); }).filter(Boolean);
  function mark() {
    var cur = heads[0];
    heads.forEach(function (h) { if (h.getBoundingClientRect().top < 140) cur = h; });
    links.forEach(function (a) { a.classList.toggle('is-on', cur && a.getAttribute('href') === '#' + cur.id); });
  }
  addEventListener('scroll', mark, { passive: true }); mark();
})();
