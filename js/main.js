/* Лёгкий наклон папки от курсора.
   На тач-экране то же самое ведёт палец: pointermove там приходит только
   пока палец на стекле, поэтому папка отклоняется во время проведения и
   возвращается в ноль по отпусканию. */
(() => {
  'use strict';

  const folder = document.querySelector('.folder');
  if (!folder) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const MAX  = 7;     // максимальный угол, градусы
  const EASE = 0.07;  // мягкость: меньше — тягучее

  let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;

  function frame(){
    cx += (tx - cx) * EASE;
    cy += (ty - cy) * EASE;
    folder.style.transform = 'rotateX(' + cy.toFixed(3) + 'deg) rotateY(' + cx.toFixed(3) + 'deg)';
    if (Math.abs(tx - cx) < 0.008 && Math.abs(ty - cy) < 0.008){
      folder.style.transform = 'rotateX(' + ty.toFixed(3) + 'deg) rotateY(' + tx.toFixed(3) + 'deg)';
      raf = null;
      return;
    }
    raf = requestAnimationFrame(frame);
  }
  const wake = () => { if (raf === null) raf = requestAnimationFrame(frame); };

  // геометрию кэшируем: getBoundingClientRect на каждое движение мыши
  // заставляет браузер пересчитывать лейаут
  let rect = null;
  const dropRect = () => { rect = null; };
  addEventListener('resize', dropRect);

  function aim(e){
    if (document.body.classList.contains('fv-open')) return;
    const r = rect || (rect = folder.getBoundingClientRect());
    const dx = (e.clientX - (r.left + r.width  / 2)) / (r.width  / 2);
    const dy = (e.clientY - (r.top  + r.height / 2)) / (r.height / 2);
    const clamp = v => Math.max(-1, Math.min(1, v / 1.5));
    // папка отклоняется ОТ курсора: ближняя к нему сторона уходит назад
    tx =  clamp(dx) * MAX;
    ty = -clamp(dy) * MAX * 0.7;
    wake();
  }

  addEventListener('pointermove', aim, { passive: true });

  // Касание тоже наводит, не дожидаясь проведения: на мыши папка кренится
  // уже от наведения на карточку, и тап должен делать то же самое —
  // иначе на телефоне наклон увидит только тот, кто повёл пальцем.
  addEventListener('pointerdown', aim, { passive: true });

  const rest = () => { tx = 0; ty = 0; wake(); };
  document.addEventListener('pointerleave', rest);
  document.addEventListener('mouseleave', rest);
  addEventListener('blur', rest);

  // Палец убрали — папка возвращается в ноль. У мыши отпускание кнопки
  // ничего не значит: курсор остался на месте, и наклон должен держаться.
  const release = e => { if (e.pointerType !== 'mouse') rest(); };
  addEventListener('pointerup', release);
  addEventListener('pointercancel', release);
})();
