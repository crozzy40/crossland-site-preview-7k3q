/* D12 part 1: the week panel. Every visible word comes from the part's strings (the JSON block inside the part). */
(function () {
  function reduced() {
    var r = false;
    try { r = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    return r || document.documentElement.classList.contains('still');
  }
  function init(root) {
    var S = {};
    try { S = JSON.parse(root.querySelector('.xw-strings').textContent); } catch (e) { return; }
    var week = root.querySelector('.xw-week'), range = root.querySelector('.xw-range'),
        ctl = root.querySelector('.xw-ctl'), out = root.querySelector('.xw-readout'),
        hint = root.querySelector('.xw-hint');
    if (!week || !range || !ctl || !out) return;
    root.classList.remove('is-static');
    root.classList.add('is-live');
    ctl.hidden = false;
    if (hint) hint.hidden = false;
    var days = [].slice.call(week.querySelectorAll('.xw-day'));
    var routine = [].slice.call(week.querySelectorAll('.xw-task.xw-r'));
    // the order in which routine tasks move over (a staggered look, no meaning beyond the demo)
    var order = [3, 8, 0, 11, 5, 1, 9, 12, 6, 2, 10, 4, 7];
    routine.forEach(function (t, i) { t.dataset.th = 5 + order[i % order.length] * (88 / Math.max(1, routine.length - 1)); });
    var last = '';
    function set(p) {
      p = +p;
      routine.forEach(function (t) { t.classList.toggle('xw-auto', p >= +t.dataset.th); });
      days.forEach(function (d) {
        var n = d.querySelectorAll('.xw-task.xw-r.xw-auto').length, o = d.querySelector('.xw-open');
        if (!o) return;
        o.style.flexGrow = n; o.classList.toggle('xw-on', n > 0);
      });
      week.classList.toggle('xw-hl', p >= 50);
      range.style.setProperty('--p', p + '%');
      var s = p <= 0 ? 'before' : (p >= 100 ? 'after' : 'mid');
      if (s !== last) {
        last = s;
        out.textContent = S['ro_' + s];
        range.setAttribute('aria-valuetext', S['vt_' + s]);
      }
    }
    var touched = false, played = false;
    function stop() { touched = true; }
    range.addEventListener('input', function () { set(range.value); });
    ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) { range.addEventListener(ev, stop, { passive: true }); });
    [].forEach.call(root.querySelectorAll('.xw-end'), function (b) {
      b.addEventListener('click', function () { stop(); range.value = b.dataset.v; set(range.value); });
    });
    if (reduced()) { range.value = 100; set(100); root.dataset.state = 'done'; return; }
    range.value = 0; set(0);
    function play() {
      if (played || touched) return;
      played = true;
      var t0 = null, D = 2600;
      function step(ts) {
        if (touched) { root.dataset.state = 'done'; return; }
        if (t0 === null) t0 = ts;
        var k = Math.min(1, (ts - t0) / D), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, v = Math.round(e * 100);
        range.value = v; set(v);
        if (k < 1) requestAnimationFrame(step); else root.dataset.state = 'done';
      }
      setTimeout(function () { if (!touched) requestAnimationFrame(step); else root.dataset.state = 'done'; }, 500);
    }
    // plays once, when the panel is first seen
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) {
        for (var i = 0; i < en.length; i++) if (en[i].isIntersecting) { io.disconnect(); play(); break; }
      }, { threshold: 0.35 });
      io.observe(root);
    } else play();
  }
  function boot() { [].forEach.call(document.querySelectorAll('[data-part="week"]'), init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
