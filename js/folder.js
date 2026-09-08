/* Открытая папка: показ окна, фильтры, закрытие */
(() => {
  'use strict';

  const view    = document.getElementById('folderView');
  const opener  = document.querySelector('.cta');
  const closeBt = document.getElementById('fvClose');
  const grid    = document.getElementById('fvGrid');
  const empty   = document.getElementById('fvEmpty');
  const toggle  = document.querySelector('.fv__toggle');
  if (!view || !opener) return;

  const tiles   = [...grid.querySelectorAll('.tile')];
  const filters = [...view.querySelectorAll('.fv__filter')];
  let last = null;

  /* ---------- открытие и закрытие ---------- */

  const isOpen = () => view.classList.contains('is-open');

  function open(){
    if (isOpen()) return;
    last = document.activeElement;
    view.classList.add('is-open');
    document.body.classList.add('fv-open');
    closeBt.focus({ preventScroll: true });
  }

  function close(){
    if (!isOpen()) return;
    view.classList.remove('is-open');
    document.body.classList.remove('fv-open');
    if (last) last.focus({ preventScroll: true });
  }

  opener.addEventListener('click', open);
  closeBt.addEventListener('click', close);

  // клик по подложке мимо панели
  view.addEventListener('click', e => { if (e.target === view) close(); });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen() && !document.body.classList.contains('player-open')) close();
  });

  /* ---------- фильтры ---------- */

  filters.forEach(btn => btn.addEventListener('click', () => {
    filters.forEach(b => b.classList.toggle('is-active', b === btn));
    apply(btn.dataset.cat);
  }));

  function apply(cat){
    let shown = 0;
    tiles.forEach(t => {
      const ok = cat === 'all' || t.dataset.cat === cat;
      t.hidden = !ok;
      if (ok) shown++;
    });
    empty.hidden = shown > 0;
  }

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
  });
})();
