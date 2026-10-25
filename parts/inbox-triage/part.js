/* D12 part 3: inbox triage. Press Run triage: routine messages are handled, drafts wait for approval,
   the complaint goes to a person. Every visible word comes from the part's strings (the JSON block inside the part). */
(function () {
  function reduced() {
    var r = false;
    try { r = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    return r || document.documentElement.classList.contains('still');
  }
  function fmt(s, o) { return String(s).replace(/\{(\w+)\}/g, function (m, k) { return k in o ? o[k] : m; }); }

  function init(root) {
    var S = {};
    try { S = JSON.parse(root.querySelector('.xt-strings').textContent); } catch (e) { return; }
    var run = root.querySelector('.xt-run'), status = root.querySelector('.xt-status');
    var items = [].slice.call(root.querySelectorAll('.xt-m'));
    if (!run || !status || !items.length) return;
    var timer = 0;
    root.classList.remove('is-static');
    root.classList.add('is-live');
    run.hidden = false;
    status.textContent = S.foot_start;

    run.addEventListener('click', function () {
      clearTimeout(timer);
      items.forEach(function (li) { li.classList.remove('xt-done', 'xt-reading'); });
      run.disabled = true;
      root.dataset.state = 'running';
      var i = 0, c = { ai: 0, wait: 0, human: 0 };
      var gap = reduced() ? 120 : 420;
      function step() {
        if (i > 0) items[i - 1].classList.remove('xt-reading');
        if (i >= items.length) {
          run.disabled = false;
          run.textContent = S.again;
          root.dataset.state = 'done';
          status.textContent = fmt(S.foot_done, { done: c.ai, wait: c.wait, people: c.human });
          return;
        }
        var li = items[i], k = li.dataset.k;
        li.classList.add('xt-done', 'xt-reading');
        if (k in c) c[k]++;
        status.textContent = fmt(S.foot_reading, { n: i + 1, total: items.length });
        i++;
        timer = setTimeout(step, gap);
      }
      step();
    });
  }
  function boot() { [].forEach.call(document.querySelectorAll('[data-part="inbox-triage"]'), init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
