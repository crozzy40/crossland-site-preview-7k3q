/* D12 part 2: WhatsApp to calendar. One lead, from first message to booked appointment.
   The run stops at the draft and waits for the visitor to approve it: people keep the decision.
   Every visible word comes from the part's strings (the JSON block inside the part). */
(function () {
  function reduced() {
    var r = false;
    try { r = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    return r || document.documentElement.classList.contains('still');
  }
  function fmt(s, o) { return String(s).replace(/\{(\w+)\}/g, function (m, k) { return k in o ? o[k] : m; }); }
  // beat -> visible step (1 to 7) and the line that explains it
  var STEP = [0, 1, 2, 3, 4, 5, 6, 6, 7, 7];
  var WHAT = [0, 1, 2, 3, 4, 5, 6, 6, 7, 7];
  var WAIT = [0, 300, 1300, 1000, 1300, 1000, 0, 1500, 1200, 1100]; // pause before each beat
  var LAST = 9, APPROVE = 5, TOTAL = 7;

  function init(root) {
    var S = {};
    try { S = JSON.parse(root.querySelector('.xc-strings').textContent); } catch (e) { return; }
    var run = root.querySelector('.xc-run'), status = root.querySelector('.xc-status'),
        approve = root.querySelector('.xc-approve');
    if (!run || !status || !approve) return;
    var items = [].slice.call(root.querySelectorAll('[data-at]'));
    var chips = [].slice.call(root.querySelectorAll('.xc-step'));
    var beat = 0, timer = 0, started = false, lastText = '';

    root.classList.remove('is-static');
    root.classList.add('is-live');
    run.hidden = false;
    approve.hidden = false;

    function say(t) { if (t !== lastText) { lastText = t; status.textContent = t; } }
    function apply(b) {
      beat = b;
      root.dataset.beat = b;
      items.forEach(function (el) {
        var at = +el.dataset.at, until = el.dataset.until ? +el.dataset.until : 99;
        el.classList.toggle('xc-on', b >= at && b <= until);
      });
      var st = STEP[b];
      chips.forEach(function (c) {
        var n = +c.dataset.step;
        c.classList.toggle('is-done', b === LAST ? true : n < st);
        c.classList.toggle('is-now', b !== LAST && n === st);
      });
      say(b === 0 ? S.w0 : fmt(S.step_of, { n: st, total: TOTAL, what: S['w' + WHAT[b]] }));
      if (b === 0) { run.disabled = false; run.textContent = S.run; }
      else if (b === LAST) { run.disabled = false; run.textContent = S.again; }
      else { run.disabled = true; run.textContent = S.running; }
    }
    function next() {
      clearTimeout(timer);
      if (beat >= LAST || beat === APPROVE) return;
      timer = setTimeout(function () { apply(beat + 1); next(); }, WAIT[beat + 1]);
    }
    function start() {
      started = true;
      clearTimeout(timer);
      apply(0);
      run.disabled = true; run.textContent = S.running;
      next();
    }
    run.addEventListener('click', start);
    approve.addEventListener('click', function () {
      if (beat !== APPROVE) return;
      apply(APPROVE + 1);
      next();
    });

    if (reduced()) { apply(LAST); return; }   // reduced motion: the finished state, nothing moves until asked
    apply(0);
    // plays once by itself when first seen; it still stops at the draft for the visitor's approval
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) {
        for (var i = 0; i < en.length; i++) if (en[i].isIntersecting) { io.disconnect(); if (!started) start(); break; }
      }, { threshold: 0.4 });
      io.observe(root);
    }
  }
  function boot() { [].forEach.call(document.querySelectorAll('[data-part="whatsapp-calendar"]'), init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
