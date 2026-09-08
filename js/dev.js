/* Замер плавности. В обычной работе ничего не делает.
   ?fps — счётчик кадров и самый долгий кадр за полсекунды */
(() => {
  'use strict';
  const q = new URLSearchParams(location.search);

  if (!q.has('fps')) return;

  const box = document.createElement('div');
  box.style.cssText =
    'position:fixed;left:10px;top:10px;z-index:999;padding:7px 10px;border-radius:7px;' +
    'background:rgba(0,0,0,.85);color:#4ade80;font:12px/1.5 ui-monospace,monospace;white-space:pre';
  document.body.appendChild(box);

  let frames = 0, worst = 0, last = performance.now(), prev = last;

  requestAnimationFrame(function tick(now){
    const dt = now - prev;
    prev = now;
    if (dt > worst) worst = dt;
    frames++;

    if (now - last >= 500){
      const fps = Math.round(frames * 1000 / (now - last));
      box.textContent = fps + ' fps\nхудший кадр ' + worst.toFixed(1) + ' мс';
      box.style.color = worst > 12 ? '#f87171' : worst > 8 ? '#fbbf24' : '#4ade80';
      frames = 0; worst = 0; last = now;
    }
    requestAnimationFrame(tick);
  });
})();
