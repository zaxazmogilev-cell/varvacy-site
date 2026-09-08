/* Подъём карточек.
   Ключевое отличие от CSS-переходов: подъём никогда не прерывается.
   Если курсор ушёл раньше, чем карточка дошла до верхней точки, она всё
   равно доигрывает ход до конца и только потом опускается.

   На тач-экране роль наведения играет палец: карточка идёт вверх по
   нажатию и вниз по отпусканию. Короткий тап отпускают раньше, чем ход
   доходит до верха, — и та же непрерывность даёт готовый «подскок». */
(() => {
  'use strict';

  const scene = document.querySelector('.scene');
  const cards = [...document.querySelectorAll('.card')];
  if (!scene || !cards.length) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const LIFT = 0.056;   // высота хода — доля от высоты сцены
  const RISE = 460;     // мс на полный подъём
  const FALL = 460;     // спуск зеркалит подъём: та же длительность

  // управление берёт на себя скрипт — переходы CSS отключаем,
  // иначе они будут спорить с покадровой записью transform
  document.body.classList.add('js-cards');

  // Квадратичное затухание. Экспоненциальная и кубическая кривые дают
  // длинный хвост: у экспоненты половина времени уходит на последние 3%
  // пути, и карточка словно зависает у верхней точки. У квадратичной хвост
  // самый короткий из плавных — подходит к верху и сразу идёт обратно.
  const ease = t => (t >= 1 ? 1 : 1 - Math.pow(1 - t, 2));

  let liftPx = 0;
  const measure = () => { liftPx = scene.getBoundingClientRect().height * LIFT; };
  measure();
  addEventListener('resize', () => { measure(); items.forEach(draw); });

  const items = cards.map(el => ({
    el,
    rot:   getComputedStyle(el).getPropertyValue('--r').trim() || '0deg',
    value: 0,          // текущая доля подъёма, 0..1
    from:  0,          // значение на старте фазы
    phase: 'idle',     // idle | rise | hold | fall
    t0:    0,
    dur:   0,
    held:  false       // курсор над карточкой или палец на ней
  }));

  // сразу фиксируем исходное положение: иначе до первого кадра скрипта
  // карточку рисовало бы правило CSS
  function draw(it){
    it.el.style.transform =
      'translate3d(0, ' + (-liftPx * it.value).toFixed(2) + 'px, 0) rotate(' + it.rot + ')';
  }

  function begin(it, phase, now){
    const to = phase === 'rise' ? 1 : 0;
    it.phase = phase;
    it.from  = it.value;
    it.t0    = now;
    // длительность пропорциональна оставшемуся пути: подхват на полпути
    // не выглядит рывком и не тянется лишнее время
    it.dur = Math.max(120, (phase === 'rise' ? RISE : FALL) * Math.abs(to - it.from));
  }

  items.forEach(draw);

  let raf = null;
  function tick(now){
    let alive = false;

    for (const it of items){
      if (it.phase === 'idle' || it.phase === 'hold') continue;

      const p = Math.min(1, (now - it.t0) / it.dur);
      const rising = it.phase === 'rise';
      const e = ease(p);
      it.value = rising ? it.from + (1 - it.from) * e
                        : it.from * (1 - e);

      if (p >= 1){
        // крайнее значение обязательно отрисовываем: без этого кадра
        // верхняя точка не показывалась бы вовсе
        it.value = rising ? 1 : 0;
        draw(it);
        if (rising){
          if (it.held){ it.phase = 'hold'; }    // не отпустили — держим
          else { begin(it, 'fall', now); alive = true; }
        } else {
          it.phase = 'idle';
        }
      } else {
        draw(it);
        alive = true;
      }
    }

    raf = alive ? requestAnimationFrame(tick) : null;
  }
  const wake = () => { if (raf === null) raf = requestAnimationFrame(tick); };

  function enter(it){
    it.held = true;
    // подхватываем с текущей точки, но цель всегда верхняя
    if (it.phase !== 'rise' && it.phase !== 'hold'){
      begin(it, 'rise', performance.now());
      wake();
    }
  }

  function leave(it){
    it.held = false;
    // если карточка ещё поднимается — не трогаем: спуск начнётся сам,
    // когда подъём дойдёт до конца
    if (it.phase === 'hold'){
      begin(it, 'fall', performance.now());
      wake();
    }
  }

  // Область наведения лежит в отдельном НЕПОДВИЖНОМ слое и связана с
  // карточкой по имени: .h-contest -> .c-contest. Если бы она поднималась
  // вместе с карточкой, то у нижнего края уезжала бы из-под курсора —
  // карточка дрожала бы вместо того, чтобы держаться наверху.
  for (const hit of document.querySelectorAll('.hit')){
    const key = [...hit.classList].find(c => c.startsWith('h-'));
    if (!key) continue;
    const it = items.find(i => i.el.classList.contains('c' + key.slice(1)));
    if (!it) continue;

    // Мышь ведём по наведению, палец и перо — по нажатию. Развести их
    // обязательно: на мыши pointerup приходит, пока курсор ещё над
    // карточкой, и она падала бы прямо под курсором.
    hit.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') enter(it); });
    hit.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') leave(it); });

    // У тач-указателя нажатие само захватывает элемент, поэтому pointerup
    // придёт сюда же, даже если палец сполз с области.
    hit.addEventListener('pointerdown',   e => { if (e.pointerType !== 'mouse') enter(it); });
    hit.addEventListener('pointerup',     e => { if (e.pointerType !== 'mouse') leave(it); });
    hit.addEventListener('pointercancel', e => { if (e.pointerType !== 'mouse') leave(it); });

    hit.addEventListener('focus', () => enter(it));
    hit.addEventListener('blur',  () => leave(it));
  }
})();
