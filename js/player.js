/* Просмотр видео */
(() => {
  'use strict';

  const pl    = document.getElementById('player');
  const frame = document.getElementById('plFrame');
  const video = document.getElementById('plVideo');
  const title = document.getElementById('plTitle');
  const desc  = document.getElementById('plDesc');
  const close = document.getElementById('plClose');
  if (!pl || !video) return;

  const isOpen = () => pl.classList.contains('is-open');
  let last = null;

  function show(tile){
    const id = tile.dataset.id;
    if (!id) return;

    last = tile;
    title.textContent = tile.querySelector('.tile__cap').textContent;
    desc.textContent  = tile.dataset.desc || '';

    // пропорции знаем заранее — окно не прыгает, когда подтянутся метаданные
    frame.style.setProperty('--ar', tile.dataset.ar || '1.7778');

    video.poster = 'assets/posters/' + id + '.webp';
    video.src    = 'assets/video/' + id + '.mp4';

    pl.classList.add('is-open');
    pl.setAttribute('aria-hidden', 'false');
    document.body.classList.add('player-open');

    // клик по плитке — это жест пользователя, поэтому звук не блокируется
    video.play().catch(() => { /* заблокировали автозапуск — сыграет по кнопке */ });
    close.focus({ preventScroll: true });
  }

  function hide(){
    if (!isOpen()) return;
    pl.classList.remove('is-open');
    pl.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('player-open');

    video.pause();
    // снимаем источник: иначе браузер продолжает докачивать ролик в фоне
    video.removeAttribute('src');
    video.load();

    if (last) last.focus({ preventScroll: true });
  }

  document.querySelectorAll('.tile').forEach(t =>
    t.addEventListener('click', () => show(t)));

  close.addEventListener('click', hide);
  pl.addEventListener('click', e => { if (e.target === pl) hide(); });

  // Esc закрывает сначала плеер, а папку под ним оставляет открытой
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen()){ e.stopPropagation(); hide(); }
  }, true);
})();
