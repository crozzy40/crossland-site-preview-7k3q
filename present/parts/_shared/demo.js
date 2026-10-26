/* D12 parts demo shell: Escape goes where the on-screen Back control goes (navigation law, rule 13). */
(function () {
  var bk = document.querySelector('[data-back]');
  if (!bk) return;
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || e.defaultPrevented) return;
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    window.location.href = bk.href;
  });
})();
